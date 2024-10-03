const recipeContainer = document.getElementById('recipeContainer');

// Fetch recipes from TheMealDB
function searchRecipe() {
    const searchInput = document.getElementById('searchInput').value;
    const mealDBUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(searchInput)}`;

    fetch(mealDBUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const recipes = data.meals;
            if (recipes) {
                renderRecipes(recipes);
            } else {
                recipeContainer.innerHTML = '<p>No recipes found.</p>';
            }
        })
        .catch(error => console.error('Error fetching recipes from MealDB:', error));
}

// Render recipes from the API
function renderRecipes(recipes) {
    recipeContainer.innerHTML = ''; // Clear previous recipes

    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.classList.add('recipe-card');

        // Collecting ingredients
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            if (recipe[`strIngredient${i}`]) {
                ingredients.push(`${recipe[`strIngredient${i}`]} - ${recipe[`strMeasure${i}`]}`);
            }
        }

        recipeCard.innerHTML = `
            <h2>${recipe.strMeal}</h2>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
            <p><strong>Ingredients:</strong></p>
            <ul>${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}</ul>
            <p><strong>Instructions:</strong></p>
            <p>${recipe.strInstructions || 'Instructions not available.'}</p>
            <button class="save-btn">Save Recipe as PDF</button>
        `;

        // Add event listener to save the recipe as a PDF
        const saveBtn = recipeCard.querySelector('.save-btn');
        saveBtn.addEventListener('click', () => saveRecipeAsPDF(recipe));

        recipeContainer.appendChild(recipeCard);
    });
}

// Save Recipe as PDF
function saveRecipeAsPDF(recipe) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add recipe details to the PDF
    doc.setFontSize(16);
    doc.text(recipe.strMeal, 10, 10);  // Recipe Title

    doc.setFontSize(12);
    doc.text("Ingredients:", 10, 20);
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (recipe[`strIngredient${i}`]) {
            ingredients.push(`${recipe[`strIngredient${i}`]} - ${recipe[`strMeasure${i}`]}`);
        }
    }
    ingredients.forEach((ingredient, index) => {
        doc.text(`${index + 1}. ${ingredient}`, 10, 30 + (index * 10));  // List of ingredients
    });

    // Add instructions to the PDF
    doc.text("Instructions:", 10, 30 + (ingredients.length * 10) + 10);
    const instructions = recipe.strInstructions || 'Instructions not available.';
    const instructionLines = doc.splitTextToSize(instructions, 190); // Adjusting text to fit the page width

    instructionLines.forEach((line, index) => {
        doc.text(line, 10, 40 + (ingredients.length * 10) + (index * 10));  // List of instructions
    });

    // Save the PDF with the recipe name as the file name
    doc.save(`${recipe.strMeal}.pdf`);
}
