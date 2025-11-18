import type {Food, Recipe, DailyMenu} from "@/types";

/**
 * Convert a Food object from the API to a Recipe object for UI
 * @param {Food} food - Food object from API
 * @returns {Recipe} Recipe object for UI components
 */
export const convertFoodToRecipe = (food: Food): Recipe => {
    const nutritionalInfo = food.nutritionalInfo || {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
    };

    return {
        id: food._id,
        title: food.name,
        description: food.description || "No description available",
        cookingTime: "Varies", // API doesn't provide cooking time
        servingSize: "1 serving", // API doesn't provide serving size
        image: getDefaultImageForCategory(food.category),
        category: food.meal || getCategoryFromMealType(food.category),
        difficulty: "medium" as const,
        nutrition: {
            calories: nutritionalInfo.calories,
            protein: `${nutritionalInfo.protein}g`,
            fat: `${nutritionalInfo.fat}g`,
            satFat: "0g", // API doesn't provide saturated fat
            carbs: `${nutritionalInfo.carbohydrates}g`,
            cholesterol: `${nutritionalInfo.cholesterol || 0}mg`,
            fiber: `${nutritionalInfo.fiber || 0}g`,
            sugar: `${nutritionalInfo.sugar || 0}g`,
            sodium: `${nutritionalInfo.sodium || 0}mg`,
        },
        ingredients:
            food.ingredients?.map((ing) => `${ing.amount} ${ing.name}`) || [],
        instructions: ["Preparation instructions not available"], // API doesn't provide instructions
        tags: food.tags || [],
    };
};

/**
 * Get default image URL based on food category
 * @param {string} category - Food category
 * @returns {string} Default image URL
 */
const getDefaultImageForCategory = (category: string): string => {
    const imageMap: Record<string, string> = {
        fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=600&fit=crop",
        vegetables:
            "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&h=600&fit=crop",
        grains: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=600&fit=crop",
        protein:
            "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=800&h=600&fit=crop",
        dairy: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&h=600&fit=crop",
        fats: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&h=600&fit=crop",
        beverages:
            "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&h=600&fit=crop",
        snacks:
            "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=600&fit=crop",
        desserts:
            "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop",
        spices:
            "https://images.unsplash.com/photo-1596040033229-a0b3b7ba0c6a?w=800&h=600&fit=crop",
    };

    return (
        imageMap[category] ||
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop"
    );
};

/**
 * Map food category to meal type
 * @param {string} category - Food category
 * @returns {string} Meal type
 */
const getCategoryFromMealType = (
    category: string
): "breakfast" | "lunch" | "dinner" | "snack" => {
    // Default mapping if meal type is not provided
    const categoryToMealMap: Record<
        string,
        "breakfast" | "lunch" | "dinner" | "snack"
    > = {
        fruits: "breakfast",
        grains: "breakfast",
        dairy: "breakfast",
        protein: "lunch",
        vegetables: "lunch",
        fats: "lunch",
        beverages: "snack",
        snacks: "snack",
        desserts: "snack",
        spices: "dinner",
    };

    return categoryToMealMap[category] || "lunch";
};

/**
 * Convert Food recommendations to DailyMenu
 * @param {Object} recommendations - Food recommendations from API
 * @param {Food[]} recommendations.breakfast - Breakfast foods
 * @param {Food[]} recommendations.lunch - Lunch foods
 * @param {Food[]} recommendations.dinner - Dinner foods
 * @param {Food[]} recommendations.snack - Snack foods
 * @returns {DailyMenu} Daily menu object
 */
export const convertRecommendationsToDailyMenu = (recommendations: {
    breakfast: Food[];
    lunch: Food[];
    dinner: Food[];
    snack: Food[];
}): DailyMenu => {
    const breakfastRecipe = recommendations.breakfast[0]
        ? convertFoodToRecipe(recommendations.breakfast[0])
        : createDefaultRecipe("breakfast");

    const lunchRecipe = recommendations.lunch[0]
        ? convertFoodToRecipe(recommendations.lunch[0])
        : createDefaultRecipe("lunch");

    const dinnerRecipe = recommendations.dinner[0]
        ? convertFoodToRecipe(recommendations.dinner[0])
        : createDefaultRecipe("dinner");

    const snackRecipes = recommendations.snack
        .slice(0, 2)
        .map(convertFoodToRecipe);

    // Calculate totals
    const allRecipes = [breakfastRecipe, lunchRecipe, dinnerRecipe, ...snackRecipes];
    const totalCalories = allRecipes.reduce(
        (sum, recipe) => sum + recipe.nutrition.calories,
        0
    );
    const totalProtein = allRecipes.reduce(
        (sum, recipe) => sum + parseFloat(recipe.nutrition.protein),
        0
    );
    const totalCarbs = allRecipes.reduce(
        (sum, recipe) => sum + parseFloat(recipe.nutrition.carbs),
        0
    );
    const totalFat = allRecipes.reduce(
        (sum, recipe) => sum + parseFloat(recipe.nutrition.fat),
        0
    );

    return {
        date: new Date().toISOString().split("T")[0],
        breakfast: breakfastRecipe,
        lunch: lunchRecipe,
        dinner: dinnerRecipe,
        snacks: snackRecipes.length > 0 ? snackRecipes : undefined,
        totalCalories,
        totalProtein: `${Math.round(totalProtein)}g`,
        totalCarbs: `${Math.round(totalCarbs)}g`,
        totalFat: `${Math.round(totalFat)}g`,
    };
};

/**
 * Create a default recipe when no food is available
 * @param {string} mealType - Type of meal
 * @returns {Recipe} Default recipe
 */
const createDefaultRecipe = (
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
): Recipe => {
    return {
        id: `default-${mealType}`,
        title: `No ${mealType} recommendation available`,
        description: "Please check back later for personalized recommendations",
        cookingTime: "N/A",
        servingSize: "N/A",
        image: getDefaultImageForCategory(mealType),
        category: mealType,
        difficulty: "easy",
        nutrition: {
            calories: 0,
            protein: "0g",
            fat: "0g",
            satFat: "0g",
            carbs: "0g",
            cholesterol: "0mg",
            fiber: "0g",
            sugar: "0g",
            sodium: "0mg",
        },
        ingredients: [],
        instructions: [],
        tags: [],
    };
};
