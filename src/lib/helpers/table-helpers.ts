// Queries
export const SELECT_BOOKING_QUERY = `
*,
vehicles (
  model,
  vehicle_colors (
    name
  )
)
`;

export const SELECT_VEHICLES_QUERY = `
*,
vehicle_colors (
  name
)
`;