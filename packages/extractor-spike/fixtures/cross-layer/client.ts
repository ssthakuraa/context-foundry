export async function approveRepair(baseUrl: string, id: string): Promise<Response> {
  return fetch(`${baseUrl}/v1/repairs/${id}/approve`, { method: 'POST' });
}

export async function approveRepairMaybe(baseUrl: string, path: string): Promise<Response> {
  return fetch(`${baseUrl}${path}`, { method: 'POST' });
}
