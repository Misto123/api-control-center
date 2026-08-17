import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST() {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('monitoringEnabled', true)
    .neq('status', 'NOT_CONFIGURED');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const results: Array<{ serviceId: string; name: string; isUp: boolean; responseTime: number | null; statusCode: number | null; error: string | null }> = [];

  for (const service of services ?? []) {
    if (!service.apiUrl) continue;

    const url = service.checkEndpoint
      ? `${service.apiUrl}${service.checkEndpoint}`
      : service.apiUrl;

    const startTime = Date.now();
    try {
      const headers: Record<string, string> = {};
      if (service.apiKey) {
        if (service.name.toLowerCase().includes('serper')) {
          headers['X-API-KEY'] = service.apiKey;
        } else {
          headers['Authorization'] = `Bearer ${service.apiKey}`;
        }
      }

      const res = await fetch(url, {
        method: service.name.toLowerCase().includes('serper') ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: service.name.toLowerCase().includes('serper') ? JSON.stringify({ q: 'health check', num: 1 }) : undefined,
        signal: AbortSignal.timeout(service.slowResponseThreshold ?? 5000),
      });

      const responseTime = Date.now() - startTime;
      const isUp = res.ok || res.status < 500;

      // Try to parse credits from response
      let creditsUpdate: { totalCredits?: number; usedCredits?: number; creditsPercent?: number } = {};
      try {
        const responseData = await res.json();
        
        // the platform API format
        if (responseData.balance_infos && Array.isArray(responseData.balance_infos)) {
          const balance = parseFloat(responseData.balance_infos[0]?.total_balance || '0');
          creditsUpdate = {
            totalCredits: balance > 0 ? balance : service.totalCredits,
            usedCredits: 0, // the platform doesn't provide "used" directly
            creditsPercent: 100, // Assume 100% if we have balance
          };
        }
        // Generic credit response formats
        else if (responseData.credits !== undefined) {
          creditsUpdate.totalCredits = responseData.credits;
          creditsUpdate.creditsPercent = responseData.credits_percent || 100;
        }
        else if (responseData.balance !== undefined) {
          creditsUpdate.totalCredits = responseData.balance;
        }
      } catch (e) {
        // Response not JSON or no credits info - that's fine
      }

      results.push({
        serviceId: service.id,
        name: service.name,
        isUp,
        responseTime,
        statusCode: res.status,
        error: isUp ? null : `HTTP ${res.status}`,
      });

      const newStatus = isUp ? 'ACTIVE' : 'DOWN';

      await supabase.from('services').update({
        status: newStatus,
        lastCheckedAt: new Date().toISOString(),
        ...creditsUpdate,
      }).eq('id', service.id);

      await supabase.from('service_metrics').insert({
        id: `m${Date.now()}${Math.random().toString(36).substring(2, 8)}`,
        serviceId: service.id,
        responseTime,
        statusCode: res.status,
        isUp,
        errorMessage: isUp ? null : `HTTP ${res.status}`,
      });

      if (!isUp) {
        const { data: existingAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('serviceId', service.id)
          .eq('type', 'SERVICE_DOWN')
          .eq('isActive', true)
          .single();

        if (!existingAlert) {
          await supabase.from('alerts').insert({
            id: `a${Date.now()}${Math.random().toString(36).substring(2, 8)}`,
            serviceId: service.id,
            type: 'SERVICE_DOWN',
            severity: 'CRITICAL',
            title: `${service.name} is DOWN`,
            message: `Service responded with HTTP ${res.status}`,
            isActive: true,
          });
        }
      } else {
        const { data: downAlert } = await supabase
          .from('alerts')
          .select('id')
          .eq('serviceId', service.id)
          .eq('type', 'SERVICE_DOWN')
          .eq('isActive', true)
          .single();

        if (downAlert) {
          await supabase.from('alerts').update({
            isActive: false,
            resolvedAt: new Date().toISOString(),
          }).eq('id', downAlert.id);

          await supabase.from('alerts').insert({
            id: `a${Date.now()}${Math.random().toString(36).substring(2, 8)}`,
            serviceId: service.id,
            type: 'SERVICE_RECOVERED',
            severity: 'INFO',
            title: `${service.name} has recovered`,
            message: `Service is back up (HTTP ${res.status}, ${responseTime}ms)`,
            isActive: false,
            isRead: false,
          });
        }
      }
    } catch (err) {
      const responseTime = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';

      results.push({
        serviceId: service.id,
        name: service.name,
        isUp: false,
        responseTime,
        statusCode: null,
        error: errorMsg,
      });

      await supabase.from('services').update({
        status: 'DOWN',
        lastCheckedAt: new Date().toISOString(),
      }).eq('id', service.id);

      await supabase.from('service_metrics').insert({
        id: `m${Date.now()}${Math.random().toString(36).substring(2, 8)}`,
        serviceId: service.id,
        responseTime,
        statusCode: null,
        isUp: false,
        errorMessage: errorMsg,
      });
    }
  }

  return NextResponse.json({ checked: results.length, results });
}
