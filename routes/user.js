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
 * This path gets recipe parameter - recipe create by the user, from type FA.
 */
router.get('/myRecipes/family/:id', async (req,res,next) => {
  const recipeId = req.params.id;
  try{
    const author = await user_utils.whoWroteMe(recipeId)
    if (author == req.userid && user_utils.isFamily(recipeId))
    {
      const preview = await user_utils.getRecipesPreviewDB(recipeId);
      const inst = await user_utils.getRecipesInstructionsDB(recipeId);

      let fullRecipe =
      {
        ingredients: inst.ingredients,
        instructions: inst.instructions,
        servings: inst.servings,
        recipeDeatils: preview

      }
      user_utils.updateLastViews(author, recipeId)
      res.status(200).send(fullRecipe);
    }
    else if (user_utils.isPrivate(recipeId))
    {
      res.status(404).send("Not family recipe.");
    }
    else
    {
      res.status(401).send("Unauthoriezed");
    }

  }
  catch(error){
      next(error);
    }
  }
)

/**
 * This path desplay all recipes created by the user/.
 */
router.get('/myRecipes/family', async (req,res,next) => {
  const author = req.userid;
  try{
      const preview = await user_utils.getAllRecipesPreviewDB(author, "Family")
      res.status(200).send(preview);
  }
  catch(error){
      next(error);
    }
  }
)





/**
 * This path gets body with recipe details and add it to data base userrecipes
 */
router.post('/addRecipe', async (req,res,next) => {
  
  try{
    let recipeDeatils =
    {
      userid: req.userid,
      title: req.body.title,
      type: req.body.type,
      readyInMinutes: req.body.readyInMinutes,
      image:  req.body.image,
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
 * This path gets body with recipe details (create by the user).
 */
router.get('/myRecipes/:id', async (req,res,next) => {
  const recipeId = req.params.id;
  try{
    const author = await user_utils.whoWroteMe(recipeId)

    if (author == req.userid)
    {
      const preview = await user_utils.getRecipesPreviewDB(recipeId);
      const inst = await user_utils.getRecipesInstructionsDB(recipeId);

      let fullRecipe =
      {
        ingredients: inst.ingredients,
        instructions: inst.instructions,
        servings: inst.servings,
        recipeDeatils: preview

      }
      user_utils.updateLastViews(author, recipeId)
      res.status(200).send(fullRecipe);
    }
    else
    {
      res.status(401).send("Unauthoriezed");
    }

  }
  catch(error){
      next(error);
    }
  }
)

/**
 * This path desplay all recipes created by the user/.
 */
router.get('/myRecipes', async (req,res,next) => {
  const author = req.userid;
  try{
      const preview = await user_utils.getAllRecipesPreviewDB(author, "Private")
      res.status(200).send(preview);
  }
  catch(error){
      next(error);
    }
  }
)


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const userid = req.userid;
    const recipeid = req.body.recipeid;
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
    const user_id = req.session.userid;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeid)); //extracting the recipe ids into array
    let result = []
    for (let i = 0; i < recipes_id_array.length; i++)
    {
      let details = await recipe_utils.getRecipeDetails(recipes_id_array[i]);      
      result.push({
          recipeid: recipes_id_array[i],
          preview: details
        })
    }
    res.status(200).send(result);
  } catch(error){
    next(error); 
  }
});



/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.delete('/favorites', async (req,res,next) => {
  try{
    const userid = req.userid;
    const recipeid = req.body.recipeid;
    await user_utils.delFavoriteRecipes(userid,recipeid);
    res.status(200).send("The Recipe successfully deleted from favorite");
    } catch(error){
    next(error);
  }
})

module.exports = router;
