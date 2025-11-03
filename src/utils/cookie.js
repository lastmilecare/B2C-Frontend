import Cookies from "js-cookie";

export const cookie = {
  set: (name, value, days = 7) => Cookies.set(name, value, { expires: days }),
  get: (name) => Cookies.get(name),
  remove: (name) => Cookies.remove(name),
};
