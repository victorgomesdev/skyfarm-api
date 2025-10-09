export function parseStatisticalResponse(response: any) {
  if (!response?.data || !Array.isArray(response.data)) {
    throw new Error("Resposta inválida: campo 'data' ausente ou malformado");
  }

  return response.data.map((item: any) => {
    const interval = item.interval ?? {};
    const stats = item.outputs?.default?.bands?.B0?.stats ?? {};

    return {
      from: interval.from,
      to: interval.to,
      stats: {
        min: stats.min,
        max: stats.max,
        mean: stats.mean,
        stDev: stats.stDev,
        sampleCount: stats.sampleCount,
        noDataCount: stats.noDataCount,
      },
    };
  });
}
