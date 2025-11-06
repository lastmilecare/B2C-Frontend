import { useGetCountriesQuery, useGetStatesByCountryQuery, useGetDistrictsByStateQuery } from "../redux/apiSlice";

export const useLocationData = (countryId, stateId) => {
  const { data: countries = [] } = useGetCountriesQuery();
  const { data: states = [] } = useGetStatesByCountryQuery(countryId, { skip: !countryId });
  const { data: districts = [] } = useGetDistrictsByStateQuery(stateId, { skip: !stateId });

  return { countries, states, districts };
};
