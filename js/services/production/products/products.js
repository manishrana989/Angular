angular.module('LeaderMESfe').factory('productsService', function ($compile, $state, $filter, LeaderMESservice, $modal, notify) {

    function productRecipeCode($scope) {
        var init = function () {
            var request = {};
            request[$scope.content.targetParameters['FieldName']] = $scope.content.targetParameters.Eq;
            request['subMenuAppPartID'] = 10010;
            var saveRequest = {
                ProductID: $scope.content.ID,
                subMenuAppPartID: 10010,
                recipeValue: []
            };

            LeaderMESservice.customAPI('DisplayRecipeDetails', request).then(function (response) {
                $scope.RecipeData = {
                    recipeData: response,
                    saveRequest: saveRequest,
                    saveRequestAPI: 'UpdateProductRecipe'
                }
            });
        };

        init();
    }

    return {
        productRecipeCode: productRecipeCode
    }
});