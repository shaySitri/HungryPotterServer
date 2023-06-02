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


const cuisineList = 
["African", "Asian", "American", "British", "Cajun", "Caribbean", "Chinese", "Eastern European", "European"
, "French", "German", "Greek", "Indian", "Irish", "Italian", "Japanese", "Jewish", "Korean", "Latin American",
"Mediterranean", "Mexican", "Middle Eastern", "Nordic", "Southern", "Spanish", "Thai", "Vietnamese"]
const dietList = ["Gluten Free", "Ketogenic", "Vegetarian", "Lacto-Vegetarian", "Ovo-Vegetarian",
"Vegan", "Pescetarian", "Paleo", "Primal", "Low FODMAP", "Whole30"]
const intoleranceList = ["Dairy", "Egg", "Gluten", "Grain", "Peanut", "Seafood", "Sesame", "Shellfish",
"Soy", "Sulfite", "Tree Nut", "Wheat"]
const sortList = ["popularity", "time"]


async function getSearchResultApi(query) {

    let paramsQ = new Object();


    if (query.query != undefined)
    {
        paramsQ.query = query.query;
    }
    else
    {
        throw { status: 400, message: "Search cannot be empty." };
    }

    if (query.cuisine != undefined)
    {
        query.cuisine = query.cuisine.toLowerCase();
        query.cuisine = query.cuisine.charAt(0).toUpperCase() + query.cuisine.slice(1);
        if (cuisineList.includes(query.cuisine))
        {
            paramsQ.cuisine = query.cuisine;
        }
        else
        {
            throw { status: 400, message: "Cuisine dont avilable." };
        }
    }

    if (query.diet != undefined)
    {
        if (dietList.includes(query.diet))
        {
            paramsQ.diet = query.diet
        }
        else
        {
            throw { status: 400, message: "Diet dont avilable." };
        }
    }

    
    if (query.intolerance != undefined)
    {
        if (intoleranceList.includes(query.diet))
        {
            paramsQ.intolerances = query.intolerance
        }
        else
        {
            throw { status: 400, message: "Intolerance dont avilable." };
        }
    }
    
    if (query.sort != undefined)
    {
        if (sortList.includes(query.sort))
        {
            paramsQ.sort = query.sort;
        }
        else
        {
            throw { status: 400, message: "Sort dont avilable." };
        }
    }

    let numResult = 5;

    if ((query.number == 10 || query.number == 15 || query.number == 5))
    {
        numResult = query.number;
    }
    else
    {
        if (query.number != undefined)
        {
            throw { status: 400, message: "Can display only 5\10\15 results.." };
        }
        else
        {
            numResult = 5
        }
    }

    paramsQ.limitLicesne = true;
    return await axios.get(`${api_domain}/complexSearch`,{
        params:
        {
            query: paramsQ.query,
            cuisine: paramsQ.cuisine,
            diet: paramsQ.diet,
            intolerances: paramsQ.intolerance,
            number: numResult,
            sort: paramsQ.sort,
            apiKey: process.env.spooncular_apiKey
        }
    });
}
async function getSearchResult(query) {
    let recipesResult = await getSearchResultApi(query);
    let { results } = recipesResult.data;
    return {
        results
    }
}



exports.getRandomRecieps = getRandomRecieps;
exports.getSearchResult = getSearchResult;
