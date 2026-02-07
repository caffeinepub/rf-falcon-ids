import type { Order } from '../backend';

export function exportOrdersToCSV(orders: Order[], filename: string = 'orders-export.csv') {
  // CSV header
  const headers = [
    'Order ID',
    'First Name',
    'Last Name',
    'ID Number',
    'Status',
    'State',
    'City',
    'Address',
    'ZIP',
    'DOB',
    'Gender',
    'Height',
    'Eye Color',
    'Creation Time',
    'Tracking Number',
    'Owner Principal',
  ];

  // CSV rows
  const rows = orders.map(order => {
    const statusText = order.status === 'pending' ? 'Pending' : order.status === 'approved' ? 'Approved' : 'Shipped';
    const creationDate = new Date(Number(order.creationTime) / 1000000).toLocaleString();
    const trackingNumber = order.trackingNumber || '';
    const ownerPrincipal = order.owner?.toString() || '';

    return [
      escapeCSV(order.id),
      escapeCSV(order.details.first_name),
      escapeCSV(order.details.last_name),
      escapeCSV(order.details.id_number),
      escapeCSV(statusText),
      escapeCSV(order.details.state_name),
      escapeCSV(order.details.city),
      escapeCSV(order.details.address),
      escapeCSV(order.details.zip),
      escapeCSV(order.details.dob),
      escapeCSV(order.details.gender),
      escapeCSV(order.details.height),
      escapeCSV(order.details.eye_color),
      escapeCSV(creationDate),
      escapeCSV(trackingNumber),
      escapeCSV(ownerPrincipal),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
