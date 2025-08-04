const mongoose = require("mongoose");
const DataEntry = require("../models/DataEntry");
const dotenv = require("dotenv");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(
"mongodb+srv://sunandvemavarapu:NnqszrAB584zCkY9@beaten1.vknkzsa.mongodb.net/?retryWrites=true&w=majority&appName=beaten1",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    
    // Clear existing entries
    await DataEntry.deleteMany();

    // Seed data
    const entry = new DataEntry({
      slideImages: [
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670120/2_kpvp4e.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670120/2_kpvp4e.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670123/5_ht5hap.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670123/4_koildp.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670123/6_wdwote.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670138/8_xu5wyx.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670138/7_zjbpnp.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752670139/9_jxccyv.png"
      ],
      mobileSlideImages: [
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/1_kcaing.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/2_r70yzn.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/5_sxlqzm.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/3_anbzmc.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/6_pipkxl.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/4_xjsrqk.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590569/7_j4a63u.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590570/8_rcrrrj.jpg",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752590570/9_qeizzr.jpg",
      ],
      collectionsImages : [
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689841/category1Desktip_op0bfg.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689813/shirts_oojhag.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689813/oversized-tshirts_oz1gku.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689822/bottom-wear_r43mtt.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689822/cargo-pants_hphn9z.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689813/jackets_dfacfm.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689813/hoodies_qonxcq.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752689835/co-ord-sets_weogc8.png"
      ],
      mobileCollectionsImages : [
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949350/1_uq0bcc.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949343/2_irem0r.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949334/3_qsq601.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949334/4_gvk6oa.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949350/5_ez30go.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949393/6_f48dw4.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949395/7_umrlur.png",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1752949923/8_dgoqs6.png",
      ],
      collections: [
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160034/Untitled_design_4_xdxk63.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled-design.png_wtqxpu.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_o4kkb8.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160033/Untitled_design_2_ax5pcj.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160033/Untitled_design_3_rcdkbr.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_7_nobm8f.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160033/Untitled_design_1_lv7gwy.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_5_o88gjf.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160015/Untitled_design_6_cnuohw.webp",
        "https://res.cloudinary.com/dk6rrrwum/image/upload/v1753160046/Untitled_design_4_1_dk8ki3.webp",
    ],
      newsContent:
       "Welcome to BEATEN! Enjoy our premium drops and secret sales. changed to cloud",
    });

    await entry.save();
    const storeData = await DataEntry.find();
    console.log("DataEntry seeded successfully!", storeData);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
