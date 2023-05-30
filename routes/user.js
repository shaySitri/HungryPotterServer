var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");


/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.userid) {
    DButils.execQuery("SELECT userid FROM users").then((users) => {
      if (users.find((x) => x.userid === req.session.userid)) {
        req.userid = req.session.userid;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipe details and add it to data base userrecipes
 */
router.post('/addRecipe', async (req,res,next) => {

  
  try{
  
    let recipeDeatils =
    {
      userid: req.userid,
      title: req.body.title,
      readyInMinutes: req.body.readyInMinutes,
      image:  req.body.image,
      popularity: 0,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      servings: req.body.servings
    }


    await user_utils.addNewRecipe(recipeDeatils);
    res.status(200).send("The Recipe Addedd Successfully");


    } catch(error){
    next(error);
  }
})


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const userid = req.userid;
    const recipeid = req.body.recipeid;
    console.log(req.body.recipeid)
    await user_utils.markAsFavorite(userid,recipeid);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});



module.exports = router;
