function formatDate(value, options) {
  if (!value) return ""; // Returns an empty string if value is null, undefined, or falsey

  return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
}

export function format_date(value) {
  return formatDate(value, { day: "2-digit", month: "short", year: "2-digit" });
}
export function userName(userProfile) {
  return `${userProfile.nombre} ${userProfile.apellido}`;
}
export function format_money(value) {
  if (typeof value !== "number") {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}
export function format_qty(value) {
  if (typeof value !== "number") {
    return "0";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export function format_dateMed(value) {
  return formatDate(value, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function format_date_month(value) {
  return formatDate(value, { month: "short", year: "2-digit" });
}

export function format_dateUnix(value) {
  return formatDate(new Date(value * 1000), {
    month: "short",
    day: "2-digit",
    year: "2-digit",
  });
}

export function dateInputLocalFormat(value) {
  return formatDate(value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function format_dateHr(value) {
  return formatDate(value, {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function format_hour(value) {
  return formatDate(value, { hour: "2-digit", minute: "2-digit" });
}

export function dateInputFormat(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // JavaScript months are 0-indexed
  const day = date.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function buildRegExp(searchText) {
  const words = searchText.trim().split(/[ \-\:]+/);
  const exps = words.map((word) => {
    return "(?=.*" + word + ")";
  });
  const fullExp = exps.join("") + ".+";
  return new RegExp(fullExp, "i");
}
export function checkPhone(number, setAlert, setNumber) {
  if (number.length !== 10) {
    return setAlert({
      message: "Los telefonos deben ser de 10 digitos",
      display: "box",
      variant: "orange",
    });
  }
  if (phone(number, "MX")[0]) {
    return setNumber(phone(number, "MX")[0].slice(1, 13));
  } else {
    return setAlert({
      message: "Revisa el telefono",
      display: "box",
      variant: "orange",
    });
  }
}

export function regExSearch(toSearch) {
  if (toSearch === "") {
    return;
  }
  const words = toSearch.trim().split(/[ \-\:]+/);
  const exps = words.map((word) => {
    return "(?=.*" + word + ")";
  });
  const fullExp = exps.join("") + ".+";
  return new RegExp(fullExp, "i");
}

export function calculateAge(birthdate) {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  const months = (today.getMonth() + 12 - birthDate.getMonth()) % 12;
  return { years: age, months: months };
}

export const styleReactSelect = {
  control: (base, state) => ({
    ...base,
    minHeight: "50px",
    marginTop: "6px",
    border: "1px solid #000",
    boxShadow: "none",
  }),
};
