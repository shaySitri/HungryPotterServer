const axios = require("axios");
const { all } = require("../auth");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list contain 3 random recieps from spooncular response and extract the relevant recipe data for preview
 * @param {*} random_recipes 
 */


async function getRandomRecipeInformation() {
    return await axios.get(`${api_domain}/random`, {
        params: {
            limitLicense: true,
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRandomRecieps() {
    let random_recipes = await getRandomRecipeInformation();
    let { recipes } = random_recipes.data;
    let randRecipes = []

    for (let i = 0; i < recipes.length; i++) {
        randRecipes.push(
            {
                id: recipes[i].id,
                title: recipes[i].title,
                readyInMinutes: recipes[i].readyInMinutes,
                image: recipes[i].image,
                popularity: recipes[i].aggregateLikes,
                vegan: recipes[i].vegan,
                vegetarian: recipes[i].vegetarian,
                glutenFree: recipes[i].glutenFree,
            }
        )
      }


    return { randRecipes }
}

exports.getRandomRecieps = getRandomRecieps;
