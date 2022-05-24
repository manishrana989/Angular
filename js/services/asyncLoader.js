angular.module('LeaderMESfe').factory('asyncLoader', function($q, $timeout, $http, Restangular, AuthService, $sessionStorage) {
	return function(options) {
		var deferred = $q.defer(),
			translations;
			
		let promises = [];
		promises.push($http.get(`js/langs/${options.key}.json`));
		if (AuthService.isAuthenticated()) {
			promises.push(
				Restangular.all('GetTranslationForKPIS')
					.post({})
					.catch(err => {
						return null;
					})
			);
		}

		Promise.all(promises)
			.then(function(responses) {
				translations = responses[0].data;
				if (responses[1]) {
					$sessionStorage.kpiTranslations = responses[1].ResponseList;
					var translationsForReplacement = {};
					responses[1].ResponseList.forEach(function(translation) {
						translationsForReplacement[translation.Name] = translation;
					});
					var keysForReplacement = Object.keys(translationsForReplacement);
					for (var key in translations) {
						for (var tranKey in translationsForReplacement) {
							if (translations[key].indexOf && translations[key].indexOf(tranKey) >= 0) {
								translations[key] = translations[key].replace(`[${tranKey}]`, translationsForReplacement[tranKey][options.key]);
							}
						}
					}
				}
				deferred.resolve(translations);
			})
			.catch(function(response) {});

		return deferred.promise;
	};
});
