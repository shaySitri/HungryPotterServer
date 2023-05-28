var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const home_utils = require("./utils/home_utils");


/**
 * This path generates 3 random recipes
 */
router.get("/randomRecipes", async (req, res, next) => {
    try {
      const random = await home_utils.getRandomRecieps();
      res.send(random);
    } catch (error) {
      next(error); // 404
    }
  });
  

module.exports = router;



