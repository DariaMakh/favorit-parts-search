export const API_URL = "http://api.favorit-parts.ru/hs/hsprice/";
const API_KEY = "00000000-0000-0000-0000-000000000001";

export function uniqueBrands(goods) {
  const seen = new Set();
  const brands = [];

  for (const item of goods) {
    const brand = typeof item?.brand === "string" ? item.brand.trim() : "";
    const normalizedBrand = brand.toLocaleLowerCase("ru");
    if (!brand || seen.has(normalizedBrand)) continue;
    seen.add(normalizedBrand);
    brands.push(brand);
  }

  return brands;
}

async function requestGoods({ number, brand, signal, fetcher = fetch }) {
  const params = new URLSearchParams({ key: API_KEY, number });
  if (brand) {
    params.set("brand", brand);
    params.set("analogues", "on");
  }
  let response;

  try {
    response = await fetcher(`${API_URL}?${params}`, { signal });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new Error("Не удалось выполнить поиск. Проверьте подключение к интернету или попробуйте позже.");
  }

  let data;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) throw new Error(`Ошибка (HTTP ${response.status}).`);
    throw new Error("Не удалось обработать ответ сервера.");
  }

  if (data?.error) {
    const message = Array.isArray(data.error) ? data.error.join("; ") : String(data.error);
    throw new Error(message);
  }

  if (!response.ok) {
    throw new Error(`Ошибка (HTTP ${response.status}).`);
  }

  if (!Array.isArray(data?.goods)) {
    throw new Error("Не удалось получить данные о товарах.");
  }

  return data.goods;
}

export async function fetchBrands(options) {
  return uniqueBrands(await requestGoods(options));
}

export async function fetchOffers(options) {
  const goods = await requestGoods(options);
  const positions = [];

  for (const item of goods) {
    positions.push(item);
    if (Array.isArray(item?.analogues)) {
      for (const analogue of item.analogues) {
        positions.push(analogue);
      }
    }
  }

  const offers = [];
  for (const [positionIndex, item] of positions.entries()) {
    if (!item || (!item.name && !item.brand && !item.number && !item.goodsID)) continue;

    const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];
    for (const [warehouseIndex, warehouse] of warehouses.entries()) {
      if (!(warehouse?.price > 0 && warehouse?.stock > 0)) continue;

      offers.push({
        id: `${positionIndex}-${warehouseIndex}`,
        name: item.name || "Без названия",
        brand: item.brand || "—",
        number: item.number || "—",
        warehouse: warehouse.code || warehouse.id || "—",
        price: warehouse.price,
        stock: warehouse.stock,
      });
    }
  }

  return offers;
}
