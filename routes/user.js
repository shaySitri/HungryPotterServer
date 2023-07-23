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

// ------------------------- BONUS -------------------------

/**
 * This path gets recipe parameter - and transfer to prepare recipe page. (BONUS)
 */
router.get('/recipes/:id', async (req,res,next) => {
  const recipeId = req.params.id;
  try{
    // handle user made recipes.
    if (user_utils.isFamily(recipeId) ||user_utils.isPrivate(recipeId) )
    {
      const author = await user_utils.whoWroteMe(recipeId)
      // get the recipes only if its own by the user.
      if (author == req.userid) 
      {
          const inst = await user_utils.getRecipesInstructionsDB(recipeId);
          let instructionsForRecipe =
          {
            ingredients: inst.ingredients,
            instructions: inst.instructions,
          }
          res.status(200).send(instructionsForRecipe);
      }
      else
      {
        res.status(401).send("Unauthoriezed");
      }
    }
    // handle api recipe.
    else if (user_utils.containsOnlyNumbers(recipeId))
    {
      const instructions = await recipe_utils.getAnalyzedInstructions(recipeId);
      res.status(200).send(instructions);
    }
    else
    {
      res.status(401).send("Page doesnt exist.");
    }

  }
  catch(error){
      next(error);
    }
  }
)

/**
 * This path dispaly all the recipes that the user want to prpeare. (BONUS)
 */
router.get('/recipes', async (req,res,next) => {
  try{
    const recipesid = await DButils.execQuery("SELECT recipeid FROM prepareMeal") 
    let recipesPrev = []
    for (let i = 0; i < recipesid.length; i++)
    {
      // handle recipe made by user (stored in db)
      let recipeId = recipesid[i].recipeid;
      if (user_utils.isFamily(recipeId) ||user_utils.isPrivate(recipeId) )
      {
        // authenticate the user
        const author = await user_utils.whoWroteMe(recipeId)
        if (author == req.userid) 
        {
          // get recipe preview
            const inst = await user_utils.getRecipesPreviewDB(recipeId,req.session.userid);
            recipesPrev.push(inst)
        }
        else
        {
          res.status(401).send("Unauthoriezed");
        }
      }
      // handle api recipe
      else if (user_utils.containsOnlyNumbers(recipeId))
      {
            const inst = await recipe_utils.getRecipeDetails(recipeId);
            recipesPrev.push(inst)
      }
      else
      {
        res.status(401).send(recipesPrev);
      }
    }
    res.status(200).send(recipesPrev);

  }
  catch(error){
      next(error);
    }
  }
)


// ---------------------------------------------------------

// -------------------- FAMILY RECIPES --------------------

/**
 * This path gets recipe parameter - recipe create by the user, from type FA.
 */
router.get('/myRecipes/family/:id', async (req,res,next) => {
  const recipeId = req.params.id;
  try{
    const author = await user_utils.whoWroteMe(recipeId)
    // author authentication
    if (author == req.userid && user_utils.isFamily(recipeId))
    {
      const preview = await user_utils.getRecipesPreviewDB(recipeId,req.session.userid);
      const inst = await user_utils.getRecipesInstructionsDB(recipeId);

      let fullRecipe =
      {
        ingredients: inst.ingredients,
        instructions: inst.instructions,
        servings: inst.servings,
        recipeDetails: preview,
        optional: inst.optional

      }
      
      user_utils.markAsWatched(author, recipeId);
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

// ---------------------------------------------------------

// ----------------------- ADD RECIPE -----------------------

/**
 * This path gets body with recipe details and add it to data base userrecipes
 */
router.post('/addRecipe', async (req,res,next) => {
  
  try{
    let recipeDeatils =
    {
      userid: req.userid,
      title: req.body.title,
      type: req.body.type, // Family/Private
      readyInMinutes: req.body.readyInMinutes,
      image:  req.body.image,
      vegan: req.body.vegan,
      vegetarian: req.body.vegetarian,
      glutenFree: req.body.glutenFree,
      ingredients: req.body.ingredients,
      instructions: req.body.instructions,
      servings: req.body.servings,
      optionalDescription: req.body.optionalDescription // the user can add more details about the recipe.
    }

    await user_utils.addNewRecipe(recipeDeatils);
    res.status(200).send("The Recipe Addedd Successfully");

    } catch(error){
    next(error);
  }
})

// ---------------------------------------------------------

// -------------------- PRIVATE RECIPES --------------------


/**
 * This path gets body with recipe details (create by the user, from type Private).
 */
router.get('/myRecipes/:id', async (req,res,next) => {
  const recipeId = req.params.id;
  try{
    const author = await user_utils.whoWroteMe(recipeId)

    // authenticate the author
    if (author == req.userid)
    {
      const preview = await user_utils.getRecipesPreviewDB(recipeId,req.session.userid);
      const inst = await user_utils.getRecipesInstructionsDB(recipeId);

      let fullRecipe =
      {
        ingredients: inst.ingredients,
        instructions: inst.instructions,
        servings: inst.servings,
        recipeDetails: preview

      }
      user_utils.markAsWatched(author, recipeId)
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

// ---------------------------------------------------------

// ------------------ FAVORITES RECIPES --------------------

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
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipeid)); //extracting the recipe ids into array
    let result = []
    for (let i = 0; i < recipes_id_array.length; i++)
    {
      // get recipe details
      let details = await recipe_utils.getRecipeDetails(recipes_id_array[i],user_id);      
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

// ---------------------------------------------------------

// ------------------ LAST WATCHED RECIPES -----------------

/**
 * This path returns the last 3 watched recipes that watched by the logged-in user
 */
router.get('/lastViews', async (req,res,next) => {
  try{
    const user_id = req.session.userid;
    // get list of recipes id
    const recipes_id = await user_utils.getLastWatchedRecipes(user_id);
    let resultPrev = []
    for (let i = 0; i < recipes_id.length; i++)
    {
      // each recipe can ben from API or DB
      let recipeId = recipes_id[i].recipeid;
      if (user_utils.containsOnlyNumbers(recipeId)) // if API
      {
        resultPrev.push(await recipe_utils.getRecipeDetails(recipeId, user_id))
      }
      else
      {
        resultPrev.push(await user_utils.getRecipesPreviewDB(recipeId, user_id))
      }
    }
    // reverse the result (from new to old)
    resultPrev = resultPrev.reverse();
    res.status(200).send(resultPrev);
  } catch(error){
    next(error); 
  }
});

// ---------------------------------------------------------

// ---------------------------------------------------------

/**
 * This path returns user private name
 */
router.get('/privateName', async (req,res,next) => {
  try{
    const user_id = req.session.userid;
      const privateName = await DButils.execQuery(`select firstname from users where userid='${user_id}';`);
      res.status(200).send(privateName[0].firstname);
    }
    catch(error){
      next(error);
    }
  });
  

module.exports = router;
