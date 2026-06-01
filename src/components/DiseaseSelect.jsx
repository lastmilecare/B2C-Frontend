import React from "react";
import SearchableMultiSelect from "./common/SearchableMultiSelect";
import DiseaseCreateModal from "./DiseaseCreateModal";
import { useSearchDiseasesQuery } from "../redux/apiSlice";
import { healthAlert } from "../utils/healthSwal";
import { PlusIcon } from "@heroicons/react/24/outline";

const maxDiseaseSelection = 5;

const DiseaseSelect = ({ value = [], onChange, label, allowManualAdd = false,}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openCreateModal = () => {
    if (value.length >= maxDiseaseSelection) {
      healthAlert({
        title: "Diseases",
        text: `You can select up to ${maxDiseaseSelection} diseases only.`,
        type: "warning",
      });
      return;
    }

    setIsModalOpen(true);
  };

  const handleDiseaseCreated = (createdDisease) => {
    if (!value.find((item) => item.id === createdDisease.id)) {
      onChange([...value, createdDisease]);
    }
  };

  return (
    <>
      <SearchableMultiSelect
        label={label}
        queryHook={useSearchDiseasesQuery}
        maxSelection={maxDiseaseSelection}
        value={value}
        onChange={onChange}
        placeholder="Search diseases..."
        allowManualAdd={allowManualAdd}
        inputAction={
          <PlusIcon
            className="h-5 w-5 mt-2 cursor-pointer hover:bg-gray-100 p-0.5 rounded"
            onClick={openCreateModal}
          />
        }
      />

      <DiseaseCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleDiseaseCreated}
      />
    </>
  );
};

export default DiseaseSelect;
