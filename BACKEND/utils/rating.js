export const getAppartementRating = (appartement) => {
  if (!appartement || !appartement.ratersNbr || appartement.ratersNbr <= 0) {
    return 0;
  }

  return appartement.rateSum / appartement.ratersNbr;
};

export const appartementRatingExpression = {
  $cond: [
    { $gt: ["$ratersNbr", 0] },
    { $divide: ["$rateSum", "$ratersNbr"] },
    0
  ]
};
