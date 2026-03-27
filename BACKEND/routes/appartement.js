import express from 'express'
import Appartement from '../models/Appartement.js'
import Rating from '../models/Rating.js';
const router = express.Router() ;

router.get('/api/v1/appartements', async (req,res)=>{
    const content = await Appartement.find() ;
    res.send(content) ;
})

router.post('/api/v1/appartement' , async (req,res)=>{
// here one important thing must be sent is the id of the owner , it is necessary
  const  newAppart = new Appartement(req.body)
  await newAppart.save() ;
  res.send("successfully saved") ;
})

router.delete('/api/v1/appartement/:id' , async (req,res)=>{
  await Appartement.findByIdAndDelete(req.params.id) ;
  res.send("successfuly deleted") ;
})
 
router.get('/api/v1/closeAppartements', async (req, res) => {
    // /api/v1/closeAppartements?X=theX&Y=theY&radius=theRaduis
    const { X, Y, radius } = req.query;

    const toRad = (val) => (val * Math.PI) / 180;

    const haversine = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // distance in km
    };

    const theAppartements = await Appartement.find();

    const closeAppartements = theAppartements.filter(appartement => {
        const distance = haversine(
            parseFloat(X), parseFloat(Y),
            appartement.coordX, appartement.coordY
        );
        return distance <= parseFloat(radius);
    });

    res.send(closeAppartements);
});

router.get('/api/v1/getByType/:type', async (req, res) => {
    
    const apps = await Appartement.find({ type: req.params.type });
    res.send(apps);

});
// this can handle lower/higher than "price/surface but fixing the other to 0 or max
router.get('/api/v1/betweenPrice/:price1/:price2', async (req , res)=>{
  let theSmallPrice = Number(req.params.price1) > Number(req.params.price2) ? Number(req.params.price2) : Number(req.params.price1) ;
  let theOtherPrice = Number(req.params.price1) < Number(req.params.price2) ? Number(req.params.price2) : Number(req.params.price1) ;
  const apps = await Appartement.find({price: {$lte: Number(theOtherPrice) , $gte: Number(theSmallPrice)}  }) ;
    // i needed to add 'e' to gte and lte to deal with the case where the client wanted an exact price apps so 
// both prices of the  are the equal 
  res.send(apps) ;
}) ;

router.get('/api/v1/betweenSurface/:surface1/:surface2', async (req , res)=>{
  let theSmallSurface = Number(req.params.surface1) > Number(req.params.surface2) ? Number(req.params.surface2) : Number(req.params.surface1) ;
  let theOtherSurface = Number(req.params.surface1) < Number(req.params.surface2) ? Number(req.params.surface2) : Number(req.params.surface1) ;
  const apps = await Appartement.find({surface: {$lte: Number(theOtherSurface) , $gte: Number(theSmallSurface)}  }) ;
    // i needed to add 'e' to gte and lte to deal with the case where the client wanted an exact surface apps so 
// both surfaces of the  are the equal 
  res.send(apps) ;
}) ;

// here to get higher than replace rating2 by 5 
router.get('/api/v1/betweenRating/:rating1/:rating2', async (req , res)=>{
  let theSmallRating = Number(req.params.rating1) > Number(req.params.rating2) ? Number(req.params.rating2) : Number(req.params.rating1) ;
  let theOtherRating = Number(req.params.rating1) < Number(req.params.rating2) ? Number(req.params.rating2) : Number(req.params.rating1) ;
  const apps = await Appartement.find({rating: {$lte: Number(theOtherRating) , $gte: Number(theSmallRating)}  }) ;
    // i needed to add 'e' to gte and lte to deal with the case where the client wanted an exact rating apps so 
// both ratings of the  are the equal 
  res.send(apps) ;
}) ;

router.get('/api/v1/getByTown/:town', async (req, res) => {
    
    const apps = await Appartement.find({ town: req.params.town });
    res.send(apps);

});
router.put('/api/v1/appartement/:id', async (req, res) => {
      // update all fields at once except rating 
    const theApp = await Appartement.findById(req.params.id);
    theApp.price = req.body.price;
    theApp.coordX = req.body.coordX;
    theApp.coordY = req.body.coordY;
    theApp.town = req.body.town ;
    theApp.type = req.body.type;
    theApp.surface = req.body.surface;
    theApp.address = req.body.address;
    await theApp.save();
    res.send("successfully updated");
});

router.put('/api/v1/updatePrice/:newPrice' , async (req,res)=>{
    const theApp = await Appartement.findById(req.query.id) ;
    theApp.price = Number(req.params.newPrice) ; 
    await theApp.save() ;
    res.send("the price was successfuly updated") ;
    // PUT /api/v1/1500?id=64abc123...
    
} )
// descending 
router.get('/api/v1/sortByPrice' , async (req,res)=>{
const theAppartements = await Appartement.find().sort({price:-1}) ;
res.send(theAppartements) ;
})
router.get('/api/v1/sortBySurface', async (req, res) => {
    const theAppartements = await Appartement.find().sort({ surface: -1 });
    res.send(theAppartements);
});

router.get('/api/v1/sortByRating', async (req, res) => {
    const theAppartements = await Appartement.find().sort({ rating: -1 });
    res.send(theAppartements);
});
// ascending 
router.get('/api/v1/sortByPriceAsc', async (req, res) => {
    const theAppartements = await Appartement.find().sort({ price: 1 });
    res.send(theAppartements);
});

router.get('/api/v1/sortBySurfaceAsc', async (req, res) => {
    const theAppartements = await Appartement.find().sort({ surface: 1 });
    res.send(theAppartements);
});

router.get('/api/v1/sortByRatingAsc', async (req, res) => {
    const theAppartements = await Appartement.find().sort({ rating: 1 });
    res.send(theAppartements);
});

router.get('/api/v1/search', async (req, res) => {
    // this is a general filterer
    const { type, town, minPrice, maxPrice, minSurface, maxSurface, minRating, maxRating } = req.query;

    let query = {} ;

    if (type) query.type = type ;
    if (town) query.town = town ;
    if (minPrice || maxPrice) query.price = {} ;
    if (minPrice) query.price.$gte = Number(minPrice) ;
    if (maxPrice) query.price.$lte = Number(maxPrice) ;
    if (minSurface || maxSurface) query.surface = {} ;
    if (minSurface) query.surface.$gte = Number(minSurface) ;
    if (maxSurface) query.surface.$lte = Number(maxSurface) ;
    if (minRating || maxRating) query.rating = {} ;
    if (minRating) query.rating.$gte = Number(minRating) ;
    if (maxRating) query.rating.$lte = Number(maxRating) ;

    const apps = await Appartement.find(query) ;
    res.send(apps) ;
}) ;

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
router.put('/api/v1/rateAppartement/:rating' , async (req,res)=>{
    
    // Uid : user id and Aid is Appar id and there are both sent in the body 
    const newRating = Number(req.params.rating) ;

    if( newRating> 5 ||newRating < 0 ) {res.send("invalid rating value"); return ;} ;
    const theApp =  await Appartement.findById(req.body.Aid) ;
    if (!theApp) { return res.send('appartement not found'); }
    const rating = await Rating.findOne({ userID: req.body.Uid, AppartementID: req.body.Aid });
        
    if (!rating) {
      // in case it is a new rating we should increments the raters number
      theApp.ratersNbr++;
     }else{
          theApp.rateSum = theApp.rateSum - rating.theRating + newRating;
     }
      await theApp.save() ;

await Rating.updateOne(
  { userID: req.body.Uid, AppartementID: req.body.Aid}, // filter
  { 
    $set: { 
      theRating: newRating, 
      date: new Date() 
    } 
  },
  { upsert: true }  // insert if not found
)
res.send('seccess') ;
})

router.get('/api/v1/getFamousAppartments/:numberOfRaters' , async (req,res)=>{
   const apps =  await Appartement.find({ratersNbr : {$gt: Number(req.params.numberOfRaters)}}) ;
    res.send(apps) ;
})

export default router ;