import express from 'express'
import {
getAppartements,
createAppartement,
deleteAppartement,
getCloseAppartements,
getByType,
betweenPrice,
betweenSurface,
betweenRating,
getByTown,
updateAppartement,
updatePrice,
sortByPrice,
sortBySurface,
sortByRating,
sortByPriceAsc,
sortBySurfaceAsc,
sortByRatingAsc,
search,
rateAppartement,
getFamousAppartments
} from '../controllers/appartement.js'
const router = express.Router() ;

router.get('/api/v1/appartements', getAppartements)

router.post('/api/v1/appartement' , createAppartement)

router.delete('/api/v1/appartement/:id' , deleteAppartement)
 
router.get('/api/v1/closeAppartements', getCloseAppartements);

router.get('/api/v1/getByType/:type', getByType);
// this can handle lower/higher than "price/surface but fixing the other to 0 or max
router.get('/api/v1/betweenPrice/:price1/:price2', betweenPrice) ;

router.get('/api/v1/betweenSurface/:surface1/:surface2', betweenSurface) ;

// here to get higher than replace rating2 by 5 
router.get('/api/v1/betweenRating/:rating1/:rating2', betweenRating) ;

router.get('/api/v1/getByTown/:town', getByTown);
router.put('/api/v1/appartement/:id', updateAppartement);

router.put('/api/v1/updatePrice/:newPrice' , updatePrice )
// descending 
router.get('/api/v1/sortByPrice' , sortByPrice)
router.get('/api/v1/sortBySurface', sortBySurface);

router.get('/api/v1/sortByRating', sortByRating);
// ascending 
router.get('/api/v1/sortByPriceAsc', sortByPriceAsc);

router.get('/api/v1/sortBySurfaceAsc', sortBySurfaceAsc);

router.get('/api/v1/sortByRatingAsc', sortByRatingAsc);

router.get('/api/v1/search', search) ;

// router.put('/api/v1/rateAppartement/:rating' , async (req,res)=>{
//     // Uid : user id and Aid is Appar id
//     const newRating = Number(req.params.rating) ;

//     if( newRating> 5 ||newRating < 0 ) {res.send("invalid rating value"); return ;} ; 
//     let rating = await Rating.findOne({userID: req.query.Uid , AppartementID : req.query.Aid}) ;
//      const theApp =  await Appartement.findById(req.query.Aid) ;
//      if(theApp== null){res.send("appartement not found") ; return ;}
//     if(rating==null){
//       rating = new Rating({
//     userID : req.query.Uid,
//     AppartementID : req.query.Aid ,
//     theRating : newRating ,
//      date : new Date() 
//       }) 
   
//     theApp.rateSum += newRating ;
//     theApp.ratersNbr ++ ;
//     await rating.save() ;
//     await theApp.save() ;
//     // for consistency in case of an error , i should start saving the rating first
//     }else{
//         theApp.rateSum = theApp.rateSum - rating.theRating + newRating;
//         rating.theRating = newRating ; 
//         rating.date = new Date() ;
//         await rating.save() ;
//         await theApp.save() ;

//     }
//     res.send("success") ;

// })
router.put('/api/v1/rateAppartement/:rating' , rateAppartement)

router.get('/api/v1/getFamousAppartments/:numberOfRaters' , getFamousAppartments)

export default router ;
