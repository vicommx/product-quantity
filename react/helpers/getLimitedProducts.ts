export const getLimitedProducts = async(entityToGetLimitedProducts: string, skuId:string) => {
  const url = `/api/dataentities/${entityToGetLimitedProducts}/search?_fields=cantidad&_where=(sku=${skuId})`
  const response = await fetch(url)
  const data = await response.json();

  return data
}
