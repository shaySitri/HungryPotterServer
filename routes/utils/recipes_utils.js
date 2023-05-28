const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */


async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}



async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }
}

async function getRecipeInstructionsApi(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
        params: {
            stepBreakdown: true,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeInstructions(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);

    let { extendedIngredients, servings } = recipe_info.data;

    let analyzedInstructions = await getRecipeInstructionsApi(recipe_id);
    //let { instructions } = analyzedInstructions.data
    let allIng = []
    let inst = []

    for (let i = 0; i < extendedIngredients.length; i++) {
        allIng.push(
            {
                name: extendedIngredients[i].name,
                quantity: extendedIngredients[i].amount,
                unit: extendedIngredients[i].unit
            }
        )
      }

    //  what to do if there is no instructions????
    
    //console.log(instructions.data)
    console.log("print: ", analyzedInstructions.data);
    // for (let i = 0; i < instructions.length; i++) {
    //     obj =  instructions[i];
    //     console.log(obj)
    //     // for (let j = 0; j < obj.steps.length; i++) {
    //     //     inst.push(obj[i].step)
    //     //  }
    //     }   
    
    

    return {
        ingredients: allIng,
        servings: servings,
        instructions: analyzedInstructions
    }
}


exports.getRecipeDetails = getRecipeDetails;
exports.getRecipeInstructions = getRecipeInstructions;
