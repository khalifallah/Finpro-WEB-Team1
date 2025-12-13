// src/utils/format.ts

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "PENDING_PAYMENT":
      return "badge-warning";
    case "PENDING_CONFIRMATION":
      return "badge-info";
    case "PROCESSING":
      return "badge-info";
    case "SHIPPED":
      return "badge-primary";
    case "CONFIRMED":
      return "badge-success";
    case "CANCELLED":
      return "badge-error";
    default:
      return "badge-neutral";
  }
};

export const formatInvoiceId = (id: number, dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Ambil Tanggal (DD)
    const day = date.getDate().toString().padStart(2, "0");

    // Ambil Bulan (MM) - Ingat getMonth() mulai dari 0
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    // Gabungkan: #INV- + Tanggal + Bulan + OrderID
    return `#INV-${day}${month}${id}`;
  } catch (error) {
    // Fallback jika tanggal error/kosong
    return `#INV-${id}`;
  }
};
