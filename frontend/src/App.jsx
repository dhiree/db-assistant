import React from "react";
import NaturalLanguageSQLQuery from "./components/page/sql";
import NaturalLanguageMongoQuery from "./components/page/mongo";

import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <NaturalLanguageSQLQuery />
        <NaturalLanguageMongoQuery />
      </div>
    </div>
  );
}

export default App;
