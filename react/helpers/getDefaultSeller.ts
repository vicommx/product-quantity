import { ProductTypes } from 'vtex.product-context'

export function getDefaultSeller(sellers?: ProductTypes.Seller[]) {
  if (!sellers || sellers.length === 0) {
    return
  }

  const marketPlaceSeller = sellers.find(seller => seller?.sellerId === '1')

  if (
    marketPlaceSeller &&
    marketPlaceSeller?.commertialOffer?.AvailableQuantity > 0
  ) {
    return marketPlaceSeller
  }

  const defaultSeller = sellers.find(seller => seller?.sellerDefault)
  if (defaultSeller) {
    return defaultSeller
  }

  return sellers[0]
}
