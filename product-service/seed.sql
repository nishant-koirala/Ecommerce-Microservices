-- Seed catalog for the Atelier storefront: 6 categories x 8 products.
TRUNCATE products RESTART IDENTITY CASCADE;
TRUNCATE categories RESTART IDENTITY CASCADE;

INSERT INTO categories (name, description) VALUES
  ('Home & Living', 'Curated pieces for a considered home'),
  ('Kitchen & Dining', 'Tools and serveware built for daily rituals'),
  ('Desk & Office', 'Stationery and workspace essentials'),
  ('Apparel', 'Clothing with an eye for craft'),
  ('Bags & Carry', 'Carry goods made to last'),
  ('Accessories', 'Small objects, considered');

INSERT INTO products (name, description, price, sku, category_id, created_at, updated_at) VALUES
  -- Home & Living (1)
  ('Linen Throw Blanket', 'Stonewashed European flax in a muted oatmeal tone. Generous 130x170cm with hand-knotted fringe on both ends.', 89.00, 'ATL-HL-001', 1, now(), now()),
  ('Ceramic Table Lamp', 'Hand-thrown stoneware base with a soft linen shade, finished in a matte sand glaze.', 145.00, 'ATL-HL-002', 1, now(), now()),
  ('Wool Area Rug', 'Dense hand-tufted wool in a warm terracotta stripe. Low pile, easy underfoot, 160x230cm.', 240.00, 'ATL-HL-003', 1, now(), now()),
  ('Oak Side Table', 'Solid European oak with a turned pedestal and gently rounded top. Naturally oiled.', 198.00, 'ATL-HL-004', 1, now(), now()),
  ('Candle Trio Set', 'Three soy-wax candles in fig, cedar, and sea salt. Approximately 45 hours burn each.', 52.00, 'ATL-HL-005', 1, now(), now()),
  ('Woven Wall Basket', 'Seagrass wall hanging woven by hand. Sold in pairs for a balanced display.', 38.00, 'ATL-HL-006', 1, now(), now()),
  ('Velvet Cushion Cover', 'Heavyweight cotton velvet in deep plum, with a concealed zip and feather insert.', 42.00, 'ATL-HL-007', 1, now(), now()),
  ('Arch Bookend Pair', 'Powder-coated steel bookends with a subtle brass finish. Individually weighted.', 34.00, 'ATL-HL-008', 1, now(), now()),

  -- Kitchen & Dining (2)
  ('Cast Iron Skillet', 'Pre-seasoned 26cm skillet with a helper handle. Passes from stove to oven without fuss.', 72.00, 'ATL-KD-001', 2, now(), now()),
  ('Stoneware Dinner Set', 'Four place settings in a speckled oatmeal glaze. Dishwasher and microwave safe.', 128.00, 'ATL-KD-002', 2, now(), now()),
  ('Olive Wood Board', 'Single-piece olive wood serving board with an oiled finish. Each grain is unique.', 46.00, 'ATL-KD-003', 2, now(), now()),
  ('Ceramic Pour-Over Set', 'Dripper and carafe in matte stoneware, with 100 bamboo filters included.', 64.00, 'ATL-KD-004', 2, now(), now()),
  ('Steel Knife Trio', 'High-carbon stainless chef, utility, and paring knives with walnut handles.', 158.00, 'ATL-KD-005', 2, now(), now()),
  ('Glass Storage Jars', 'Six airtight jars in two sizes with bamboo lids for pantry organization.', 48.00, 'ATL-KD-006', 2, now(), now()),
  ('Linen Napkin Set', 'Six stonewashed linen napkins in an oatmeal finish. Generous 45x45cm.', 36.00, 'ATL-KD-007', 2, now(), now()),
  ('Copper Measuring Set', 'Six hand-hammered copper cups on a ring, from 1/8 cup to 1 cup.', 58.00, 'ATL-KD-008', 2, now(), now()),

  -- Desk & Office (3)
  ('Brass Desk Lamp', 'Adjustable brass arm lamp with a warm dimmable LED. Weighted marble base.', 118.00, 'ATL-DO-001', 3, now(), now()),
  ('Leather Desk Mat', 'Full-grain leather pad with stitched edges. Protects surfaces while you work.', 62.00, 'ATL-DO-002', 3, now(), now()),
  ('Fountain Pen', 'Machined brass fountain pen with a fine steel nib. Includes ink cartridges.', 88.00, 'ATL-DO-003', 3, now(), now()),
  ('Notebook Set', 'Three A5 notebooks with cotton covers, 192 pages of 100gsm paper each.', 29.00, 'ATL-DO-004', 3, now(), now()),
  ('Wireless Keyboard', 'Low-profile mechanical keyboard in a warm beige palette. Bluetooth and USB-C.', 132.00, 'ATL-DO-005', 3, now(), now()),
  ('Ceramic Mug', 'Hand-glazed 350ml mug with a comfortable handle and drip-proof rim.', 24.00, 'ATL-DO-006', 3, now(), now()),
  ('Paper Tray Organizer', 'Stackable cork-lined trays in three tiers for paper and small tools.', 44.00, 'ATL-DO-007', 3, now(), now()),
  ('Desk Valet Tray', 'Sculpted ceramic catch-all with a matte finish for keys and sundries.', 32.00, 'ATL-DO-008', 3, now(), now()),

  -- Apparel (4)
  ('Merino Crew Sweater', 'Extra-fine merino wool in a relaxed crew cut. Fully fashioned, naturally anti-odor.', 128.00, 'ATL-AP-001', 4, now(), now()),
  ('Organic Cotton Tee', 'Heavyweight 220gsm organic cotton with a boxy fit and ribbed collar.', 38.00, 'ATL-AP-002', 4, now(), now()),
  ('Wool Overshirt', 'Unstructured brushed wool overshirt with corozo buttons and patch pockets.', 158.00, 'ATL-AP-003', 4, now(), now()),
  ('Canvas Tote Trousers', 'Relaxed cotton-canvas trousers with an elasticated waist and deep pockets.', 92.00, 'ATL-AP-004', 4, now(), now()),
  ('Chore Jacket', 'Durable cotton twill chore jacket in a warm olive. Utility pockets throughout.', 112.00, 'ATL-AP-005', 4, now(), now()),
  ('Ribbed Beanie', 'Chunky ribbed merino beanie with a deep fold. One size.', 32.00, 'ATL-AP-006', 4, now(), now()),
  ('Selvedge Denim', '12oz Japanese selvedge denim with a straight leg. Sanforized, will break in beautifully.', 148.00, 'ATL-AP-007', 4, now(), now()),
  ('Linen Camp Shirt', 'Garment-washed European linen camp shirt with a relaxed point collar.', 78.00, 'ATL-AP-008', 4, now(), now()),

  -- Bags & Carry (5)
  ('Canvas Weekender', 'Heavy waxed-canvas duffel with leather handles and a separate shoe compartment.', 168.00, 'ATL-BG-001', 5, now(), now()),
  ('Leather Backpack', 'Vegetable-tanned leather backpack with brass hardware and a padded laptop sleeve.', 238.00, 'ATL-BG-002', 5, now(), now()),
  ('Tote Shopping Bag', 'Structured cotton-canvas tote with an interior pocket and flat leather grips.', 48.00, 'ATL-BG-003', 5, now(), now()),
  ('Travel Toiletry Kit', 'Waxed-canvas hanging kit with waterproof lining and three compartments.', 56.00, 'ATL-BG-004', 5, now(), now()),
  ('Slim Card Wallet', 'Horween leather card wallet in tan that patinas with use. Holds up to six cards.', 54.00, 'ATL-BG-005', 5, now(), now()),
  ('Crossbody Sling', 'Compact waxed-canvas sling with an adjustable strap and magnetic flap.', 86.00, 'ATL-BG-006', 5, now(), now()),
  ('Packing Cube Set', 'Three ripstop packing cubes in a nested set. Compression zippers throughout.', 42.00, 'ATL-BG-007', 5, now(), now()),
  ('Golf Cloth Duffle', 'Everyday cotton-duck duffle with a full-length zip and leather zipper pulls.', 138.00, 'ATL-BG-008', 5, now(), now()),

  -- Accessories (6)
  ('Brass Keychain', 'Solid brass keyring with an engraved leaf detail. Develops a natural patina.', 18.00, 'ATL-AC-001', 6, now(), now()),
  ('Leather Watch Strap', 'Quick-release Horween strap in espresso. Fits 20mm lugs.', 44.00, 'ATL-AC-002', 6, now(), now()),
  ('Wool Scarf', 'Double-faced lambswool scarf in a tonal herringbone weave.', 68.00, 'ATL-AC-003', 6, now(), now()),
  ('Ceramic Coasters', 'Set of four matte stoneware coasters with a cork backing.', 26.00, 'ATL-AC-004', 6, now(), now()),
  ('Sunglasses', 'Hand-finished acetate frames with polarized lenses and a case.', 96.00, 'ATL-AC-005', 6, now(), now()),
  ('Pocket Knife', 'Compact folding knife with a walnut handle and stainless blade. Includes belt sheath.', 74.00, 'ATL-AC-006', 6, now(), now()),
  ('Brass Pen Clip', 'Machined brass clip that keeps a pen on a pocket or notebook cover.', 16.00, 'ATL-AC-007', 6, now(), now()),
  ('Leather Gloves', 'Soft lambskin gloves with a suede palm and touchscreen fingertips.', 84.00, 'ATL-AC-008', 6, now(), now());
