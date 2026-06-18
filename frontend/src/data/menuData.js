// ════════════════════════════════════════════════════════════════
//  RD CAFÉ & BAR — Single source of truth for the whole menu.
//  Menu page AND navbar search both read from here.
// ════════════════════════════════════════════════════════════════
const IMG = '';

export const MENU_DATA = {
  hot: {
    label: '☕ Hot Coffee',
    cover: `${IMG}/Coffee/Hot Coffee/Hot Coffee.PNG`,
    items: [
      { _id:'hc1',  image:`${IMG}/Coffee/Hot Coffee/Classic Espresso.jpg`,      name:'Classic Espresso',      description:'Double shot single-origin espresso, bold and velvety',         price:180 },
      { _id:'hc2',  image:`${IMG}/Coffee/Hot Coffee/Americano.jpg`,             name:'Americano',             description:'Espresso with hot water, smooth and clean',                    price:200 },
      { _id:'hc3',  image:`${IMG}/Coffee/Hot Coffee/Cappuccino.jpg`,            name:'Cappuccino',            description:'Equal parts espresso, steamed milk and thick foam',             price:220 },
      { _id:'hc4',  image:`${IMG}/Coffee/Hot Coffee/Cafe Latte.jpg`,            name:'Café Latte',            description:'Espresso with silky steamed milk, mild and creamy',             price:220 },
      { _id:'hc5',  image:`${IMG}/Coffee/Hot Coffee/Caramel Latte.jpg`,         name:'Caramel Latte',         description:'Espresso, steamed milk with rich caramel drizzle',              price:240 },
      { _id:'hc6',  image:`${IMG}/Coffee/Hot Coffee/Vanilla Latte.jpg`,         name:'Vanilla Latte',         description:'Smooth latte with sweet Madagascar vanilla',                    price:240 },
      { _id:'hc7',  image:`${IMG}/Coffee/Hot Coffee/Hazelnut Mocha.jpg`,        name:'Hazelnut Mocha',        description:'Espresso, chocolate, hazelnut syrup, steamed milk',             price:250 },
      { _id:'hc8',  image:`${IMG}/Coffee/Hot Coffee/Dark Mocha Coffee.jpg`,     name:'Dark Mocha Coffee',     description:'Intense dark chocolate espresso blend',                         price:250 },
      { _id:'hc9',  image:`${IMG}/Coffee/Hot Coffee/Honey Cinnamon Latte.jpg`,  name:'Honey Cinnamon Latte',  description:'Warm honey, cinnamon spice with espresso',                      price:240 },
      { _id:'hc10', image:`${IMG}/Coffee/Hot Coffee/Matcha Latte.jpg`,          name:'Matcha Latte',          description:'Ceremonial grade matcha with steamed milk',                     price:240 },
      { _id:'hc11', image:`${IMG}/Coffee/Hot Coffee/Rd Signature Coffee.jpg`,   name:'RD Signature Coffee',   description:'Our secret blend — smooth, rich, unforgettable',               price:260 },
      { _id:'hc12', image:`${IMG}/Coffee/Hot Coffee/japanese Blend Coffee.jpg`, name:'Japanese Blend Coffee', description:'Light roast pour-over, floral and delicate notes',              price:230 },
      { _id:'hc13', image:`${IMG}/Coffee/Hot Coffee/Brown Suger Latte.jpg`,     name:'Brown Sugar Latte',     description:'Espresso with brown sugar syrup and oat milk foam',             price:250 },
      { _id:'hc14', image:`${IMG}/Coffee/Hot Coffee/Hojicha latte.jpg`,         name:'Hojicha Latte',         description:'Roasted Japanese green tea with steamed milk',                  price:240 },
      { _id:'hc15', image:`${IMG}/Coffee/Hot Coffee/Mocha Chocolate .jpg`,      name:'Mocha Chocolate',       description:'Rich mocha with Belgian chocolate shavings',                    price:250 },
    ]
  },
  cold: {
    label: '🧊 Cold Coffee',
    cover: `${IMG}/Coffee/Cold Coffee/Cold Coffee.PNG`,
    items: [
      { _id:'cc1', image:`${IMG}/Coffee/Cold Coffee/Iced Americano.jpg`,       name:'Iced Americano',       description:'Espresso over ice with cold water — clean and bold',           price:220 },
      { _id:'cc2', image:`${IMG}/Coffee/Cold Coffee/Iced Cafe Latte.jpg`,      name:'Iced Café Latte',      description:'Espresso with cold milk poured over ice',                       price:240 },
      { _id:'cc3', image:`${IMG}/Coffee/Cold Coffee/Caramel Iced Latte.jpg`,   name:'Caramel Iced Latte',   description:'Cold latte with golden caramel drizzle',                        price:250 },
      { _id:'cc4', image:`${IMG}/Coffee/Cold Coffee/Vanilla Cold Brew.jpg`,    name:'Vanilla Cold Brew',    description:'18-hour cold brew with Madagascar vanilla',                     price:250 },
      { _id:'cc5', image:`${IMG}/Coffee/Cold Coffee/Coffee Float.jpg`,         name:'Coffee Float',         description:'Cold brew topped with vanilla ice cream scoop',                 price:260 },
      { _id:'cc6', image:`${IMG}/Coffee/Cold Coffee/Coconut Coffee Cooler.jpg`,name:'Coconut Coffee Cooler',description:'Cold brew with coconut milk and toasted coconut',               price:250 },
      { _id:'cc7', image:`${IMG}/Coffee/Cold Coffee/Ice Matcha Latte.jpg`,     name:'Ice Matcha Latte',     description:'Ceremonial matcha over iced oat milk',                          price:250 },
      { _id:'cc8', image:`${IMG}/Coffee/Cold Coffee/Rd Cold Brew Special.jpg`, name:'RD Cold Brew Special', description:'Our signature 24-hour cold brew — must try!',                   price:270 },
    ]
  },
  tea: {
    label: '🍵 Tea',
    cover: `${IMG}/Tea/Tea.PNG`,
    items: [
      { _id:'t1',  image:`${IMG}/Tea/japanese green tea.jpg`, name:'Japanese Green Tea', description:'Premium sencha from Shizuoka, fresh and grassy',    price:180 },
      { _id:'t2',  image:`${IMG}/Tea/Match_tea.jpg`,          name:'Matcha Tea',         description:'Ceremonial grade matcha, whisked to perfection',    price:200 },
      { _id:'t3',  image:`${IMG}/Tea/Lemon Tea.jpg`,          name:'Lemon Tea',          description:'Black tea with fresh lemon and honey',              price:190 },
      { _id:'t4',  image:`${IMG}/Tea/Honey Ginger tea.jpg`,   name:'Honey Ginger Tea',   description:'Fresh ginger with organic honey, warming',          price:200 },
      { _id:'t5',  image:`${IMG}/Tea/Milk tea.jpg`,           name:'Milk Tea',           description:'Classic creamy milk tea, comforting and smooth',    price:210 },
      { _id:'t6',  image:`${IMG}/Tea/Royal milk tea.jpg`,     name:'Royal Milk Tea',     description:'Japanese-style rich milk tea, velvety texture',     price:220 },
      { _id:'t7',  image:`${IMG}/Tea/Earl Grey Tea.jpg`,      name:'Earl Grey Tea',      description:'Bergamot-scented black tea, aromatic and classic',  price:190 },
      { _id:'t8',  image:`${IMG}/Tea/Peach Iced Tea.jpg`,     name:'Peach Iced Tea',     description:'Cold brewed tea with fresh peach syrup over ice',   price:210 },
      { _id:'t9',  image:`${IMG}/Tea/Jasmine Tea.jpg`,        name:'Jasmine Tea',        description:'Floral jasmine green tea, delicate and fragrant',   price:180 },
      { _id:'t10', image:`${IMG}/Tea/Chai Masala tea.jpg`,    name:'Chai Masala Tea',    description:'Spiced milk tea with cardamom, ginger, clove',      price:200 },
      { _id:'t11', image:`${IMG}/Tea/Chamomile Tea.jpg`,      name:'Chamomile Tea',      description:'Calming chamomile flowers, perfect for sleep mood', price:190 },
      { _id:'t12', image:`${IMG}/Tea/Mint Tea.jpg`,           name:'Mint Tea',           description:'Fresh peppermint leaves, cooling and refreshing',   price:180 },
    ]
  },
  softdrinks: {
    label: '🥤 Soft Drinks',
    cover: `${IMG}/Soft Drinks/Soft Drinks.PNG`,
    items: [
      { _id:'sd1',  image:`${IMG}/Soft Drinks/Coca Cola.jpg`,            name:'Coca-Cola',           description:'Classic Coca-Cola, ice cold and refreshing',        price:120 },
      { _id:'sd2',  image:`${IMG}/Soft Drinks/Cocacola Zero.jpg`,        name:'Coca-Cola Zero',      description:'Zero sugar, full Coca-Cola taste',                  price:120 },
      { _id:'sd3',  image:`${IMG}/Soft Drinks/Sprite.jpg`,               name:'Sprite',              description:'Crisp lemon-lime soda, perfectly chilled',          price:120 },
      { _id:'sd4',  image:`${IMG}/Soft Drinks/Fanta Orange.jpg`,         name:'Fanta Orange',        description:'Fruity orange fizz, fun and refreshing',            price:120 },
      { _id:'sd5',  image:`${IMG}/Soft Drinks/Lemon Soda.jpg`,           name:'Lemon Soda',          description:'Fresh lemon juice with sparkling soda water',       price:130 },
      { _id:'sd6',  image:`${IMG}/Soft Drinks/Melon Soda.jpg`,           name:'Melon Soda',          description:'Japanese-style honeydew melon cream soda',          price:130 },
      { _id:'sd7',  image:`${IMG}/Soft Drinks/Yuzu Sparkling.jpg`,       name:'Yuzu Sparkling',      description:'Japanese yuzu citrus sparkling drink',              price:150 },
      { _id:'sd8',  image:`${IMG}/Soft Drinks/Passionfruit Soda.jpg`,    name:'Passionfruit Soda',   description:'Tropical passionfruit with sparkling water',         price:150 },
      { _id:'sd9',  image:`${IMG}/Soft Drinks/Premimum mango Nectar.jpg`,name:'Premium Mango Nectar',description:'Rich Alphonso mango nectar, thick and tropical',    price:150 },
      { _id:'sd10', image:`${IMG}/Soft Drinks/Red Bull.jpg`,             name:'Red Bull',            description:'Energy drink, original flavor',                     price:180 },
      { _id:'sd11', image:`${IMG}/Soft Drinks/Mineral Water.jpg`,        name:'Mineral Water',       description:'Still mineral water, pure and clean',               price:80 },
      { _id:'sd12', image:`${IMG}/Soft Drinks/Masala Soda.jpg`,          name:'Masala Soda',         description:'Spiced soda with chaat masala and lemon',           price:130 },
    ]
  },
  beer: {
    label: '🍺 Beer',
    cover: `${IMG}/Beer/Beer.PNG`,
    items: [
      { _id:'b1',  image:`${IMG}/Beer/Asahi Super Dry.jpg`,            name:'Asahi Super Dry',         description:"Japan's most iconic dry lager, crisp and clean",     price:260 },
      { _id:'b2',  image:`${IMG}/Beer/Sapporo Premium.jpg`,            name:'Sapporo Premium',         description:'Premium Japanese lager, smooth malt flavor',          price:260 },
      { _id:'b3',  image:`${IMG}/Beer/Kirin Ichiban.jpg`,              name:'Kirin Ichiban',           description:'First press brewing, pure and refreshing',            price:260 },
      { _id:'b4',  image:`${IMG}/Beer/Suntory The Premimum Malts.jpg`, name:'Suntory Premium Malts',   description:'Rich golden lager with deep malt character',          price:270 },
      { _id:'b5',  image:`${IMG}/Beer/Asahi Black.jpg`,                name:'Asahi Black',             description:'Dark Munich-style lager, roasted malt notes',        price:270 },
      { _id:'b6',  image:`${IMG}/Beer/Yebisu Premimu.jpg`,             name:'Yebisu Premium',          description:"All-malt premium lager since 1890, Tokyo's finest", price:280 },
      { _id:'b7',  image:`${IMG}/Beer/Sapporo Black Leble.jpg`,        name:'Sapporo Black Label',     description:'Extra dry finish, perfect with grilled food',         price:260 },
      { _id:'b8',  image:`${IMG}/Beer/Orion Draft.jpg`,                name:'Orion Draft',             description:"Okinawa's famous draft beer, light and tropical",   price:260 },
      { _id:'b9',  image:`${IMG}/Beer/Coedo beer.jpg`,                 name:'Coedo Craft Beer',        description:'Japanese craft beer, Beniaka sweet potato ale',      price:280 },
      { _id:'b10', image:`${IMG}/Beer/Hakkaisan beer.jpg`,             name:'Hakkaisan Beer',          description:'Premium sake brewery craft beer from Niigata',       price:280 },
      { _id:'b11', image:`${IMG}/Beer/kirin Lager.jpg`,                name:'Kirin Lager',             description:'Classic Japanese lager, balanced and smooth',        price:260 },
      { _id:'b12', image:`${IMG}/Beer/Virgin Mojito.jpg`,              name:'Virgin Mojito',           description:'Alcohol-free mint lime mojito, refreshing',          price:250 },
    ]
  },
  wine: {
    label: '🍷 Wine',
    cover: `${IMG}/Wine/Wine.PNG`,
    items: [
      { _id:'w1', image:`${IMG}/Wine/House Red Wine.jpg`,              name:'House Red Wine',     description:'Our daily pour — smooth, fruity and approachable',  price:500 },
      { _id:'w2', image:`${IMG}/Wine/Gerard Bertrand Pinot Noir.jpg`,  name:'Pinot Noir',         description:'Elegant red with cherry and earthy notes',          price:700 },
      { _id:'w3', image:`${IMG}/Wine/Chateau Mont-Redon Bordeaux.jpg`, name:'Bordeaux Reserve',   description:'Classic French blend, structured and complex',       price:700 },
      { _id:'w4', image:`${IMG}/Wine/Cloudy Bay Sauvignon Blanc.jpg`,  name:'Sauvignon Blanc',    description:'New Zealand classic, crisp citrus and herbal',       price:600 },
      { _id:'w5', image:`${IMG}/Wine/Sula Sauvignon Blanc.jpg`,        name:'Sula White Wine',    description:'Indian premium white, tropical fruit forward',       price:500 },
      { _id:'w6', image:`${IMG}/Wine/Yellow Tail Chardonnay.jpg`,      name:'Chardonnay',         description:'Buttery Australian Chardonnay, oak-aged',           price:600 },
      { _id:'w7', image:`${IMG}/Wine/Fresco Moscato.jpg`,              name:'Moscato',            description:'Sweet Italian sparkling, perfect with dessert',      price:550 },
      { _id:'w8', image:`${IMG}/Wine/Elderflower.jpg`,                 name:'Elderflower Spritz', description:'Floral elderflower with sparkling wine, elegant',    price:550 },
    ]
  },
  food: {
    label: '🥗 Food & Grill',
    cover: `${IMG}/Food & Grill/Food & Grill.PNG`,
    items: [
      { _id:'f1',  image:`${IMG}/Food & Grill/Grilled Chicken Salad.jpg`,   name:'Grilled Chicken Salad',   description:'Tender grilled chicken on fresh mixed greens',      price:380 },
      { _id:'f2',  image:`${IMG}/Food & Grill/Caesar Salad.jpg`,            name:'Caesar Salad',            description:'Romaine, parmesan, croutons, house Caesar dressing', price:320 },
      { _id:'f3',  image:`${IMG}/Food & Grill/Greek Salad.jpg`,             name:'Greek Salad',             description:'Tomato, cucumber, olive, feta, oregano dressing',   price:320 },
      { _id:'f4',  image:`${IMG}/Food & Grill/Grilled Chicken Sandwich.jpg`,name:'Grilled Chicken Sandwich',description:'Juicy chicken fillet, lettuce, sauce, toasted bun', price:420 },
      { _id:'f5',  image:`${IMG}/Food & Grill/Chicken Tikka.jpg`,           name:'Chicken Tikka',           description:'Tandoor-marinated chicken tikka with mint chutney', price:480 },
      { _id:'f6',  image:`${IMG}/Food & Grill/Chicken Sekuwa.jpg`,          name:'Chicken Sekuwa',          description:'Nepali-style spiced grilled chicken skewer',         price:450 },
      { _id:'f7',  image:`${IMG}/Food & Grill/Sekuwa.jpg`,                  name:'Buff Sekuwa',             description:'Traditional smoked buffalo sekuwa, spicy',          price:480 },
      { _id:'f8',  image:`${IMG}/Food & Grill/Choila.jpg`,                  name:'Buff Choila',             description:'Spiced grilled buff with mustard oil and spices',    price:420 },
      { _id:'f9',  image:`${IMG}/Food & Grill/Sukuti.jpg`,                  name:'Sukuti',                  description:'Sun-dried spiced buff, crispy and full of flavor',  price:380 },
      { _id:'f10', image:`${IMG}/Food & Grill/Fish & Cips.jpg`,             name:'Fish & Chips',            description:'Beer-battered fish fillet with golden fries',        price:520 },
      { _id:'f11', image:`${IMG}/Food & Grill/Aloo Jeera.jpg`,              name:'Aloo Jeera',              description:'Cumin-spiced potatoes, simple Nepali comfort food',  price:280 },
    ]
  },
  dessert: {
    label: '🍰 Desserts & Sweets',
    cover: `${IMG}/Dessert/Dessert.PNG`,
    items: [
      { _id:'ds1',  image:`${IMG}/Dessert/Chocolate Lava Cake.jpg`,    name:'Chocolate Lava Cake',     description:'Warm molten chocolate cake with vanilla ice cream', price:320 },
      { _id:'ds2',  image:`${IMG}/Dessert/Cheesecake.jpg`,             name:'New York Cheesecake',     description:'Creamy baked cheesecake with berry compote',        price:300 },
      { _id:'ds3',  image:`${IMG}/Dessert/Tiramisu.jpg`,               name:'Tiramisu',                description:'Classic Italian coffee-soaked layered dessert',     price:320 },
      { _id:'ds4',  image:`${IMG}/Dessert/Red Velvet Cake.jpg`,        name:'Red Velvet Cake',         description:'Soft red velvet with cream cheese frosting',         price:280 },
      { _id:'ds5',  image:`${IMG}/Dessert/Chocolate Brownie.jpg`,      name:'Chocolate Brownie',       description:'Fudgy brownie with walnuts and chocolate chunks',    price:250 },
      { _id:'ds6',  image:`${IMG}/Dessert/Chocolate Mousse.jpg`,       name:'Belgian Chocolate Mousse',description:'Silky dark chocolate mousse, rich and airy',        price:300 },
      { _id:'ds7',  image:`${IMG}/Dessert/Macarons.jpg`,               name:'French Macarons',         description:'Assorted macarons — 6 pieces, delicate and sweet',   price:350 },
      { _id:'ds8',  image:`${IMG}/Dessert/Chocolate Truffle Cake.jpg`, name:'Chocolate Truffle Cake',  description:'Decadent layered chocolate truffle cake',           price:320 },
      { _id:'ds9',  image:`${IMG}/Dessert/Panna Cotta.jpg`,            name:'Vanilla Panna Cotta',     description:'Silky Italian vanilla cream with berry sauce',       price:270 },
      { _id:'ds10', image:`${IMG}/Dessert/Carrot Cake.jpg`,            name:'Carrot Cake',             description:'Spiced carrot cake with cream cheese frosting',      price:280 },
      { _id:'ds11', image:`${IMG}/Dessert/Chocolate Chip Cookie.jpg`,  name:'Chocolate Chip Cookies',  description:'Warm gooey cookies — 3 pieces',                     price:180 },
      { _id:'ds12', image:`${IMG}/Dessert/Chocolate Donut.jpg`,        name:'Chocolate Donut',         description:'Glazed chocolate donut with sprinkles',             price:150 },
    ]
  },
};

export const CAT_ORDER = ['hot','cold','tea','softdrinks','beer','wine','food','dessert'];

// Flat list of every item, with its category — used by search.
export const ALL_ITEMS = Object.entries(MENU_DATA).flatMap(([key, cat]) =>
  cat.items.map(item => ({ ...item, category: key, categoryLabel: cat.label }))
);
