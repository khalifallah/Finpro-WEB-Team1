import { ShippingService } from "@/types/shipping";

export const calculateShippingCost = (
  distance: number,
  weight: number,
  service: ShippingService
): number => {
  // Calculate based on distance and weight
  const baseCost = service.cost;
  const distanceCost = distance * 1000; // IDR per km
  const weightCost = (weight / 1000) * 500; // IDR per kg

  return Math.round(baseCost + distanceCost + weightCost);
};

export const formatShippingEstimate = (etd: string): string => {
  if (etd.includes("-")) {
    const [min, max] = etd.split("-").map((d) => d.trim());
    return `${min}-${max} business days`;
  }
  return `${etd} business days`;
};

export const validateShippingDistance = (
  distance: number,
  maxDistance?: number
): boolean => {
  if (!maxDistance) return true;
  return distance <= maxDistance;
};

export const getShippingServices = async (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  weight: number
): Promise<ShippingService[]> => {
  try {
    // This would call RajaOngkir API or your backend
    // For now, return mock data
    return [
      {
        service: "REG",
        serviceCode: "REG",
        serviceName: "Regular",
        description: "Standard delivery",
        cost: 15000,
        etd: "2-3 days",
        estimatedDays: "2-3 days",
        maxDistance: 100,
      },
      {
        service: "EXP",
        serviceCode: "EXP",
        serviceName: "Express",
        description: "Fast delivery",
        cost: 30000,
        etd: "1-2 days",
        estimatedDays: "1-2 days",
        maxDistance: 50,
      },
      {
        service: "SDS",
        serviceCode: "SDS",
        serviceName: "Same Day",
        description: "Same day delivery",
        cost: 50000,
        etd: "Same day",
        estimatedDays: "Same day",
        maxDistance: 25,
      },
    ];
  } catch (error) {
    console.error("Error fetching shipping services:", error);
    throw error;
  }
};
