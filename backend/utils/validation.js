function validateBooking(data) {
  const {
    name,
    phone,
    pickup,
    destination,
    tdate,
    cartype
  } = data;

  if (
    !name ||
    !phone ||
    !pickup ||
    !destination ||
    !tdate ||
    !cartype
  ) {
    return {
      valid: false,
      message: "Please fill all required booking fields."
    };
  }

  if (typeof name !== "string" || name.trim().length < 2) {
    return {
      valid: false,
      message: "Please enter a valid name."
    };
  }

  if (!/^[0-9]{10}$/.test(String(phone).trim())) {
    return {
      valid: false,
      message: "Please enter a valid 10-digit phone number."
    };
  }

  // Pickup Validation (Supports plain string or structured object with latitude/longitude)
  let pickupAddress = "";
  if (typeof pickup === "string") {
    pickupAddress = pickup.trim();
  } else if (pickup && typeof pickup === "object") {
    pickupAddress = typeof pickup.address === "string" ? pickup.address.trim() : "";

    if (pickup.latitude !== undefined && pickup.latitude !== null && pickup.latitude !== "") {
      const lat = Number(pickup.latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        return {
          valid: false,
          message: "Invalid pickup latitude. Must be between -90 and 90."
        };
      }
    }

    if (pickup.longitude !== undefined && pickup.longitude !== null && pickup.longitude !== "") {
      const lng = Number(pickup.longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        return {
          valid: false,
          message: "Invalid pickup longitude. Must be between -180 and 180."
        };
      }
    }
  }

  if (!pickupAddress || pickupAddress.length < 2) {
    return {
      valid: false,
      message: "Please enter a valid pickup location address."
    };
  }

  if (
    typeof destination !== "string" ||
    destination.trim().length < 2
  ) {
    return {
      valid: false,
      message: "Please enter a valid destination."
    };
  }

  if (typeof cartype !== "string" || cartype.trim().length < 2) {
    return {
      valid: false,
      message: "Please select a valid car type."
    };
  }

  return {
    valid: true
  };
}

module.exports = {
  validateBooking
};