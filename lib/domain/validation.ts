export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function assertRestaurantInput(input: unknown) {
  if (!input || typeof input !== "object") {
    throw new ValidationError("Restaurant input must be an object");
  }

  const value = input as Record<string, unknown>;
  if (!isNonEmptyString(value.name)) {
    throw new ValidationError("Restaurant name is required", "name");
  }
  if (!isNonEmptyString(value.address)) {
    throw new ValidationError("Restaurant address is required", "address");
  }
  if (
    !Number.isInteger(value.tableCount) ||
    (value.tableCount as number) < 1
  ) {
    throw new ValidationError(
      "Table count must be a positive integer",
      "tableCount",
    );
  }
  if (
    !isFiniteNumber(value.taxPercent) ||
    value.taxPercent < 0 ||
    value.taxPercent > 100
  ) {
    throw new ValidationError(
      "Tax percentage must be between 0 and 100",
      "taxPercent",
    );
  }
}

export function assertOrderType(value: unknown): asserts value is
  | "DINE_IN"
  | "TAKEAWAY"
  | "PREORDER_DINE_IN" {
  if (
    value !== "DINE_IN" &&
    value !== "TAKEAWAY" &&
    value !== "PREORDER_DINE_IN"
  ) {
    throw new ValidationError("Unsupported order type", "orderType");
  }
}

export function assertPositiveQuantity(value: unknown): asserts value is number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new ValidationError(
      "Quantity must be a positive integer",
      "quantity",
    );
  }
}

export function assertMoney(value: unknown, field = "amount"): asserts value is number {
  if (!isFiniteNumber(value) || value < 0 || Math.round(value * 100) !== value * 100) {
    throw new ValidationError(
      `${field} must be a non-negative amount with at most two decimals`,
      field,
    );
  }
}
