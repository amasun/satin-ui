import { Board, Tile } from "@/components/kit";
import { Cart, ProductCard, PriceRange, PromoCode, SortFilter } from "@/tiles/shop/Buy";
import { Favourite, Gallery, Ratings, SizePicker, StockBadges, Swatches } from "@/tiles/shop/Choose";
import { AddressCard, CardForm, Delivery, OrderSummary, Pricing } from "@/tiles/shop/Pay";
import { Countdown, NotifyMe, OrderProgress, PaymentSuccess, ShippingTimeline, TabBar } from "@/tiles/shop/Wait";

/**
 * Third screen: a small coffee-gear shop, from choosing a product to waiting
 * for it. The gallery and the card form set the rhythm.
 *
 * `col` / `row` pin each tile on the 8 x 11 desktop board. Below 1320px the
 * board reflows (4, then 2 columns) in source order, so single-width tiles
 * are listed next to a partner of matching height.
 */
export default function ShopBoard() {
  return (
    <Board label="Shop and checkout">
      <Tile label="Product photos" col={1} row={1} w={3} h={4} tone="raised"><Gallery /></Tile>
      <Tile label="Colour" col={4} row={1} w={2}><Swatches /></Tile>
      <Tile label="Size" col={4} row={2} w={2}><SizePicker /></Tile>
      <Tile label="Reviews" col={4} row={3} w={2} h={2}><Ratings /></Tile>
      <Tile label="Stock" col={6} row={1} h={2}><StockBadges /></Tile>
      <Tile label="Favourite" col={7} row={1} h={2}><Favourite /></Tile>
      <Tile label="Sort and filter" col={6} row={3} w={2}><SortFilter /></Tile>
      <Tile label="Price range" col={6} row={4} w={3}><PriceRange /></Tile>
      <Tile label="Cart" col={1} row={5} w={2} h={3}><Cart /></Tile>
      <Tile label="Promo code" col={1} row={8} w={2}><PromoCode /></Tile>
      <Tile label="Product card" col={3} row={5} h={4}><ProductCard /></Tile>
      <Tile label="Payment" col={8} row={5} h={2} tone="dark"><PaymentSuccess /></Tile>
      <Tile label="Back in stock" col={8} row={7} h={2}><NotifyMe /></Tile>
      <Tile label="Card details" col={4} row={5} w={2} h={4}><CardForm /></Tile>
      <Tile label="Delivery" col={6} row={5} w={2} h={2}><Delivery /></Tile>
      <Tile label="Address" col={6} row={7} w={2} h={2}><AddressCard /></Tile>
      <Tile label="Order summary" col={1} row={9} w={2} h={3} tone="raised"><OrderSummary /></Tile>
      <Tile label="Order progress" col={3} row={9} w={3} h={2}><OrderProgress /></Tile>
      <Tile label="Tab bar" col={3} row={11} w={3} tone="dark"><TabBar /></Tile>
      <Tile label="Shipping" col={6} row={9} w={2} h={3}><ShippingTimeline /></Tile>
      <Tile label="Flash sale" col={8} row={1} h={3}><Countdown /></Tile>
      <Tile label="Bean Club" col={8} row={9} h={3}><Pricing /></Tile>
    </Board>
  );
}
