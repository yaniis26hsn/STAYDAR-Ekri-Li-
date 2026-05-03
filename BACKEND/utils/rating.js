
export const getAppartmentRating = (appartement) = {
    if(!appartement || !appartement.ratersNbr || ! appartement.ratersNbr<=0)  return 0 ;
       
    
    return appartement.rateSum/ratersNbr ;
}