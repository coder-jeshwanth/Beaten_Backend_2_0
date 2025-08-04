const DataEntry = require("../models/DataEntry");

// Create a new DataEntry
exports.createDataEntry = async (req, res) => {
  try {
    const { slideImages, newsContent } = req.body;
    const dataEntry = new DataEntry({ slideImages, newsContent });
    await dataEntry.save();
    res.status(201).json(dataEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all DataEntries
exports.getDataEntries = async (req, res) => {
  try {
    const dataEntries = await DataEntry.find();
    res.status(200).json(dataEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single DataEntry by ID
exports.getDataEntryById = async (req, res) => {
  try {
    const dataEntry = await DataEntry.findById(req.params.id);
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json(dataEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a DataEntry by ID
exports.updateDataEntry = async (req, res) => {
  try {
    const { slideImages, newsContent } = req.body;
    const dataEntry = await DataEntry.findByIdAndUpdate(
      req.params.id,
      { slideImages, newsContent },
      { new: true }
    );
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json(dataEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a DataEntry by ID
exports.deleteDataEntry = async (req, res) => {
  try {
    const dataEntry = await DataEntry.findByIdAndDelete(req.params.id);
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json({ message: "DataEntry deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get only slideImages
exports.getSlideImages = async (req, res) => {
  try {
    const dataEntry = await DataEntry.find();
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json({ slideImages: dataEntry[0].slideImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update only slideImages
exports.updateSlideImages = async (req, res) => {
  try {
    const { slideImages } = req.body;
    // const dataEntry = await DataEntry.findByIdAndUpdate(
    //   req.params.id,
    //   { slideImages },
    //   { new: true }
    // );
    const dataEntry = await DataEntry.findOneAndUpdate({}, { slideImages }, { new: true });
    
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log("updated succesfully");
    
    res.status(200).json({ slideImages: dataEntry.slideImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all slideImages
exports.deleteSlideImages = async (req, res) => {
  try {
    const dataEntry = await DataEntry.findByIdAndUpdate(
      req.params.id,
      { slideImages: [] },
      { new: true }
    );
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log("deleted succesfully");
    
    res
      .status(200)
      .json({
        message: "All slideImages deleted",
        slideImages: dataEntry.slideImages,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//--- mobile
exports.getMobileSlideImages = async (req, res) => {
    try {
      const dataEntry = await DataEntry.find();
      if (!dataEntry) {
        return res.status(404).json({ message: "DataEntry not found" });
      }
      res.status(200).json({ mobileSlideImages: dataEntry[0].mobileSlideImages });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Update only slideImages
  exports.updateMobileSlideImages = async (req, res) => {
    try {
      const { mobileSlideImages } = req.body;
      // const dataEntry = await DataEntry.findByIdAndUpdate(
      //   req.params.id,
      //   { slideImages },
      //   { new: true }
      // );
      const dataEntry = await DataEntry.findOneAndUpdate({}, { mobileSlideImages }, { new: true });
      
      if (!dataEntry) {
        return res.status(404).json({ message: "DataEntry not found" });
      }
      console.log("mobile updated succesfully");
      
      res.status(200).json({ slideImages: dataEntry.mobileSlideImages });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  // Delete all slideImages
  exports.deleteMobileSlideImages = async (req, res) => {
    try {
      const dataEntry = await DataEntry.findByIdAndUpdate(
        req.params.id,
        { slideImages: [] },
        { new: true }
      );
      if (!dataEntry) {
        return res.status(404).json({ message: "DataEntry not found" });
      }
      console.log("deleted succesfully");
      
      res
        .status(200)
        .json({
          message: "All slideImages deleted",
          slideImages: dataEntry.mobileSlideImages,
        });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  //--- collections - dekstop
exports.getCollectionImages = async (req, res) => {
  try {
    const dataEntry = await DataEntry.find();
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log("camed to collection images get");
    
    res.status(200).json({ collectionsImages: dataEntry[0].collectionsImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update only slideImages
exports.updateCollectionImages = async (req, res) => {
  try {
    const { collectionsImages } = req.body;
    // const dataEntry = await DataEntry.findByIdAndUpdate(
    //   req.params.id,
    //   { slideImages },
    //   { new: true }
    // );
    const dataEntry = await DataEntry.findOneAndUpdate({}, { collectionsImages }, { new: true });
    
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log("collections updated succesfully");
    
    res.status(200).json({ collectionsImages: dataEntry.collectionsImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMobileCollectionImages = async (req, res) => {
  try {
    const dataEntry = await DataEntry.find();
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log("camed to mobile collection images get");
    //console.log("mobile collection images", dataEntry[0].mobileCollectionsImages);
    
      res.status(200).json({ mobileCollectionsImages: dataEntry[0].mobileCollectionsImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update only slideImages
exports.updateMobileCollectionImages = async (req, res) => {
  try {
    const { mobileCollectionsImages } = req.body;
    // const dataEntry = await DataEntry.findByIdAndUpdate(
    //   req.params.id,
    //   { slideImages },
    //   { new: true }
    // );
    const dataEntry = await DataEntry.findOneAndUpdate({}, { mobileCollectionsImages }, { new: true });
    
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log("mobile collections updated succesfully");
    
    res.status(200).json({ mobileCollectionsImages: dataEntry.mobileCollectionsImages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete all slideImages
// exports.deleteMobileSlideImages = async (req, res) => {
//   try {
//     const dataEntry = await DataEntry.findByIdAndUpdate(
//       req.params.id,
//       { slideImages: [] },
//       { new: true }
//     );
//     if (!dataEntry) {
//       return res.status(404).json({ message: "DataEntry not found" });
//     }
//     console.log("deleted succesfully");
    
//     res
//       .status(200)
//       .json({
//         message: "All slideImages deleted",
//         slideImages: dataEntry.mobileSlideImages,
//       });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


// Get only newsContent
exports.getNewsContent = async (req, res) => {
  try {
    const dataEntry = await DataEntry.find();
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    console.log(dataEntry);
    
    res.status(200).json({ newsContent: dataEntry[0].newsContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update only newsContent
exports.updateNewsContent = async (req, res) => {
  try {
    const { newsContent } = req.body;
    const dataEntry = await DataEntry.findOneAndUpdate({}, { newsContent }, { new: true });
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json({ newsContent: dataEntry.newsContent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete newsContent (set to empty string)
exports.deleteNewsContent = async (req, res) => {
  try {
    const dataEntry = await DataEntry.findByIdAndUpdate(
      req.params.id,
      { newsContent: "" },
      { new: true }
    );
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res
      .status(200)
      .json({
        message: "newsContent deleted",
        newsContent: dataEntry.newsContent,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get only collections
exports.getCollections = async (req, res) => {
  try {
    const dataEntry = await DataEntry.find();
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json({ collections: dataEntry[0].collections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update only collections
exports.updateCollections = async (req, res) => {
  try {
    const { collections } = req.body;  
    const dataEntry = await DataEntry.findOneAndUpdate({}, { collections }, { new: true });
    if (!dataEntry) {
      return res.status(404).json({ message: "DataEntry not found" });
    }
    res.status(200).json({ collections: dataEntry.collections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};