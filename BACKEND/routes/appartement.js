import express from 'express'
import { verifyToken } from '../middleware/auth.js';
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
getFamousAppartments ,
ContactAppartOwner
} from '../controllers/appartement.js'
const router = express.Router() ;

router.get('/appartements', getAppartements)

router.post('/appartement' , verifyToken ,createAppartement)
// TODO: make sure that owner don't have more than 10 apparts before adding 

router.delete('/appartement/:id' ,verifyToken , deleteAppartement)
 
router.get('/closeAppartements', getCloseAppartements);

router.get('/getByType/:type', getByType);
// this can handle lower/higher than "price/surface but fixing the other to 0 or max
router.get('/betweenPrice/:price1/:price2', betweenPrice) ;

router.get('/betweenSurface/:surface1/:surface2', betweenSurface) ;

// here to get higher than replace rating2 by 5 
router.get('/betweenRating/:rating1/:rating2', betweenRating) ;

router.get('/getByTown/:town', getByTown);
router.put('/appartement/:id', verifyToken ,updateAppartement);
// id is the id of the appartement 

router.put('/updatePrice/:newPrice' ,verifyToken , updatePrice )
// descending 
router.get('/sortByPrice' , sortByPrice)
router.get('/sortBySurface', sortBySurface);

router.get('/sortByRating', sortByRating);
// ascending 
router.get('/sortByPriceAsc', sortByPriceAsc);

router.get('/sortBySurfaceAsc', sortBySurfaceAsc);

router.get('/sortByRatingAsc', sortByRatingAsc);

router.get('/search', search) ;

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
router.put('/rateAppartement/:rating' ,verifyToken, rateAppartement)

router.get('/getFamousAppartments/:numberOfRaters' , getFamousAppartments)
router.get('/ContactAppartOwner/:id',verifyToken, ContactAppartOwner) 

export default router ;

 