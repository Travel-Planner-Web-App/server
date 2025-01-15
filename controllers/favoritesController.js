let favorites = [];

const getFavorites = (req, res) => {
  res.status(200).json({ favorites });
};

const addFavorite = (req, res) => {
  const { location } = req.body;

  if (!location) {
    return res.status(400).json({ error: "Location is required." });
  }

  const favorite = { id: Date.now(), location };
  favorites.push(favorite);
  res.status(201).json({ favorite });
};

const removeFavorite = (req, res) => {
  const { id } = req.params;

  favorites = favorites.filter((favorite) => favorite.id !== parseInt(id, 10));
  res.status(200).json({ message: "Favorite removed." });
};

module.exports = { getFavorites, addFavorite, removeFavorite };
