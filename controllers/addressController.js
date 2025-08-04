const Address = require("../models/Address");
const User = require("../models/User");

// Add a new address to user's address book
exports.addAddress = async (req, res) => {
  try {
    const { name, address, city, state, country, postalCode, phone, isDefault } = req.body;
    const userId = req.user._id;
    const newAddress = await Address.create({
      user: userId,
      name: name || '', // Save name
      address,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault: !!isDefault,
    });
    // Add to user's addressBook
    await User.findByIdAndUpdate(userId, { $push: { addressBook: newAddress._id } });
    res.status(201).json({ success: true, data: newAddress });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Get all addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("addressBook");
    res.json({ success: true, data: user.addressBook });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update an address
exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user._id;
    // Only allow update if address belongs to user
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    if (req.body.name !== undefined) address.name = req.body.name; // Update name
    Object.assign(address, req.body);
    await address.save();
    res.json({ success: true, data: address });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user._id;
    // Only allow delete if address belongs to user
    const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ success: false, message: "Address not found" });
    }
    // Remove from user's addressBook
    await User.findByIdAndUpdate(userId, { $pull: { addressBook: addressId } });
    res.json({ success: true, message: "Address deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}; 