-- Seed catalog for the Atelier storefront: 6 categories x 8 products.
TRUNCATE products RESTART IDENTITY CASCADE;
TRUNCATE categories RESTART IDENTITY CASCADE;

INSERT INTO categories (name, description, image_url) VALUES
  ('Home & Living', 'Curated pieces for a considered home', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
  ('Kitchen & Dining', 'Tools and serveware built for daily rituals', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288'),
  ('Desk & Office', 'Stationery and workspace essentials', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36'),
  ('Apparel', 'Clothing with an eye for craft', 'https://images.unsplash.com/photo-1475178626620-a4d074967452'),
  ('Bags & Carry', 'Carry goods made to last', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62'),
  ('Accessories', 'Small objects, considered', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083');

INSERT INTO products (name, description, price, sku, image_url, category_id, created_at, updated_at) VALUES
  -- Home & Living (1)
  ('Linen Throw Blanket', 'Stonewashed European flax in a muted oatmeal tone. Generous 130x170cm with hand-knotted fringe on both ends.', 89.00, 'ATL-HL-001', 'https://images.unsplash.com/photo-1565539433134-f41a89c7346e', 1, now(), now()),
  ('Ceramic Table Lamp', 'Hand-thrown stoneware base with a soft linen shade, finished in a matte sand glaze.', 145.00, 'ATL-HL-002', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c', 1, now(), now()),
  ('Wool Area Rug', 'Dense hand-tufted wool in a warm terracotta stripe. Low pile, easy underfoot, 160x230cm.', 240.00, 'ATL-HL-003', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', 1, now(), now()),
  ('Oak Side Table', 'Solid European oak with a turned pedestal and gently rounded top. Naturally oiled.', 198.00, 'ATL-HL-004', 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c', 1, now(), now()),
  ('Candle Trio Set', 'Three soy-wax candles in fig, cedar, and sea salt. Approximately 45 hours burn each.', 52.00, 'ATL-HL-005', 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4', 1, now(), now()),
  ('Woven Wall Basket', 'Seagrass wall hanging woven by hand. Sold in pairs for a balanced display.', 38.00, 'ATL-HL-006', 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261', 1, now(), now()),
  ('Velvet Cushion Cover', 'Heavyweight cotton velvet in deep plum, with a concealed zip and feather insert.', 42.00, 'ATL-HL-007', 'https://images.unsplash.com/photo-1513694203232-719a280e022f', 1, now(), now()),
  ('Arch Bookend Pair', 'Powder-coated steel bookends with a subtle brass finish. Individually weighted.', 34.00, 'ATL-HL-008', 'https://images.unsplash.com/photo-1519682337058-a94d519337bc', 1, now(), now()),

  -- Kitchen & Dining (2)
  ('Cast Iron Skillet', 'Pre-seasoned 26cm skillet with a helper handle. Passes from stove to oven without fuss.', 72.00, 'ATL-KD-001', 'https://images.unsplash.com/photo-1556911220-bff31c812dba', 2, now(), now()),
  ('Stoneware Dinner Set', 'Four place settings in a speckled oatmeal glaze. Dishwasher and microwave safe.', 128.00, 'ATL-KD-002', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288', 2, now(), now()),
  ('Olive Wood Board', 'Single-piece olive wood serving board with an oiled finish. Each grain is unique.', 46.00, 'ATL-KD-003', 'https://images.unsplash.com/photo-1484154218962-a197022b5858', 2, now(), now()),
  ('Ceramic Pour-Over Set', 'Dripper and carafe in matte stoneware, with 100 bamboo filters included.', 64.00, 'ATL-KD-004', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', 2, now(), now()),
  ('Steel Knife Trio', 'High-carbon stainless chef, utility, and paring knives with walnut handles.', 158.00, 'ATL-KD-005', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136', 2, now(), now()),
  ('Glass Storage Jars', 'Six airtight jars in two sizes with bamboo lids for pantry organization.', 48.00, 'ATL-KD-006', 'https://images.unsplash.com/photo-1495521821757-a1efb6729352', 2, now(), now()),
  ('Linen Napkin Set', 'Six stonewashed linen napkins in an oatmeal finish. Generous 45x45cm.', 36.00, 'ATL-KD-007', 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9', 2, now(), now()),
  ('Copper Measuring Set', 'Six hand-hammered copper cups on a ring, from 1/8 cup to 1 cup.', 58.00, 'ATL-KD-008', 'https://images.unsplash.com/photo-1504222490345-c075b6008014', 2, now(), now()),

  -- Desk & Office (3)
  ('Brass Desk Lamp', 'Adjustable brass arm lamp with a warm dimmable LED. Weighted marble base.', 118.00, 'ATL-DO-001', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36', 3, now(), now()),
  ('Leather Desk Mat', 'Full-grain leather pad with stitched edges. Protects surfaces while you work.', 62.00, 'ATL-DO-002', 'https://images.unsplash.com/photo-1503945438517-f65904a52ce6', 3, now(), now()),
  ('Fountain Pen', 'Machined brass fountain pen with a fine steel nib. Includes ink cartridges.', 88.00, 'ATL-DO-003', 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe', 3, now(), now()),
  ('Notebook Set', 'Three A5 notebooks with cotton covers, 192 pages of 100gsm paper each.', 29.00, 'ATL-DO-004', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57', 3, now(), now()),
  ('Wireless Keyboard', 'Low-profile mechanical keyboard in a warm beige palette. Bluetooth and USB-C.', 132.00, 'ATL-DO-005', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 3, now(), now()),
  ('Ceramic Mug', 'Hand-glazed 350ml mug with a comfortable handle and drip-proof rim.', 24.00, 'ATL-DO-006', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93', 3, now(), now()),
  ('Paper Tray Organizer', 'Stackable cork-lined trays in three tiers for paper and small tools.', 44.00, 'ATL-DO-007', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc', 3, now(), now()),
  ('Desk Valet Tray', 'Sculpted ceramic catch-all with a matte finish for keys and sundries.', 32.00, 'ATL-DO-008', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72', 3, now(), now()),

  -- Apparel (4)
  ('Merino Crew Sweater', 'Extra-fine merino wool in a relaxed crew cut. Fully fashioned, naturally anti-odor.', 128.00, 'ATL-AP-001', 'https://images.unsplash.com/photo-1576566588028-4147f3842f27', 4, now(), now()),
  ('Organic Cotton Tee', 'Heavyweight 220gsm organic cotton with a boxy fit and ribbed collar.', 38.00, 'ATL-AP-002', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 4, now(), now()),
  ('Wool Overshirt', 'Unstructured brushed wool overshirt with corozo buttons and patch pockets.', 158.00, 'ATL-AP-003', 'https://images.unsplash.com/photo-1542272604-787c3835535d', 4, now(), now()),
  ('Canvas Tote Trousers', 'Relaxed cotton-canvas trousers with an elasticated waist and deep pockets.', 92.00, 'ATL-AP-004', 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246', 4, now(), now()),
  ('Chore Jacket', 'Durable cotton twill chore jacket in a warm olive. Utility pockets throughout.', 112.00, 'ATL-AP-005', 'https://images.unsplash.com/photo-1521334884684-d80222895322', 4, now(), now()),
  ('Ribbed Beanie', 'Chunky ribbed merino beanie with a deep fold. One size.', 32.00, 'ATL-AP-006', 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531', 4, now(), now()),
  ('Selvedge Denim', '12oz Japanese selvedge denim with a straight leg. Sanforized, will break in beautifully.', 148.00, 'ATL-AP-007', 'https://images.unsplash.com/photo-1475178626620-a4d074967452', 4, now(), now()),
  ('Linen Camp Shirt', 'Garment-washed European linen camp shirt with a relaxed point collar.', 78.00, 'ATL-AP-008', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105', 4, now(), now()),

  -- Bags & Carry (5)
  ('Canvas Weekender', 'Heavy waxed-canvas duffel with leather handles and a separate shoe compartment.', 168.00, 'ATL-BG-001', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62', 5, now(), now()),
  ('Leather Backpack', 'Vegetable-tanned leather backpack with brass hardware and a padded laptop sleeve.', 238.00, 'ATL-BG-002', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 5, now(), now()),
  ('Tote Shopping Bag', 'Structured cotton-canvas tote with an interior pocket and flat leather grips.', 48.00, 'ATL-BG-003', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7', 5, now(), now()),
  ('Travel Toiletry Kit', 'Waxed-canvas hanging kit with waterproof lining and three compartments.', 56.00, 'ATL-BG-004', 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571', 5, now(), now()),
  ('Slim Card Wallet', 'Horween leather card wallet in tan that patinas with use. Holds up to six cards.', 54.00, 'ATL-BG-005', 'https://images.unsplash.com/photo-1559563458-527698bf5295', 5, now(), now()),
  ('Crossbody Sling', 'Compact waxed-canvas sling with an adjustable strap and magnetic flap.', 86.00, 'ATL-BG-006', 'https://images.unsplash.com/photo-1591561954557-26941169b49e', 5, now(), now()),
  ('Packing Cube Set', 'Three ripstop packing cubes in a nested set. Compression zippers throughout.', 42.00, 'ATL-BG-007', 'https://images.unsplash.com/photo-1488646953014-85cb44e25828', 5, now(), now()),
  ('Golf Cloth Duffle', 'Everyday cotton-duck duffle with a full-length zip and leather zipper pulls.', 138.00, 'ATL-BG-008', 'https://images.unsplash.com/photo-1580913428023-02c695666d61', 5, now(), now()),

  -- Accessories (6)
  ('Brass Keychain', 'Solid brass keyring with an engraved leaf detail. Develops a natural patina.', 18.00, 'ATL-AC-001', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', 6, now(), now()),
  ('Leather Watch Strap', 'Quick-release Horween strap in espresso. Fits 20mm lugs.', 44.00, 'ATL-AC-002', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d', 6, now(), now()),
  ('Wool Scarf', 'Double-faced lambswool scarf in a tonal herringbone weave.', 68.00, 'ATL-AC-003', 'https://images.unsplash.com/photo-1521369909029-2afed882baee', 6, now(), now()),
  ('Ceramic Coasters', 'Set of four matte stoneware coasters with a cork backing.', 26.00, 'ATL-AC-004', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d', 6, now(), now()),
  ('Sunglasses', 'Hand-finished acetate frames with polarized lenses and a case.', 96.00, 'ATL-AC-005', 'https://images.unsplash.com/photo-1511499767150-a48a237f0083', 6, now(), now()),
  ('Pocket Knife', 'Compact folding knife with a walnut handle and stainless blade. Includes belt sheath.', 74.00, 'ATL-AC-006', 'https://images.unsplash.com/photo-1579566346927-c68383817a25', 6, now(), now()),
  ('Brass Pen Clip', 'Machined brass clip that keeps a pen on a pocket or notebook cover.', 16.00, 'ATL-AC-007', 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3', 6, now(), now()),
  ('Leather Gloves', 'Soft lambskin gloves with a suede palm and touchscreen fingertips.', 84.00, 'ATL-AC-008', 'https://images.unsplash.com/photo-1516826957135-700dedea698c', 6, now(), now());
