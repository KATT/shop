export function formatPrice(price: number) {
  return (price / 100).toFixed(2).replace('.', ',') + ' SEK';
}
