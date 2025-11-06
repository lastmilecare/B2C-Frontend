import React from "react";
import SearchableMultiSelect from "./common/SearchableMultiSelect";
import { useSearchDiseasesQuery } from "../redux/apiSlice";

const DiseaseSelect = ({ value, onChange,label }) => {
    return (
        <SearchableMultiSelect
            label={label}
            queryHook={useSearchDiseasesQuery}
            maxSelection={5}
            value={value}
            onChange={onChange}
            placeholder="Search diseases..."
        />
    );
};

export default DiseaseSelect;
