"use client";

import { useState } from "react";
import axios from "axios";
import { Database, Server, Search, AlertCircle } from "lucide-react";
import api from "../../api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NaturalLanguageSQLQuery() {
  const [sqlConnection, setSqlConnection] = useState({
    host: "",
    port: "",
    username: "",
    password: "",
    database: "",
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [tableName, setTableName] = useState("");
  const [sqlQuery, setSqlQuery] = useState(null);
  const [result, setResult] = useState([]);
  const [error, setError] = useState("");
  const [isQuerying, setIsQuerying] = useState(false);

  const connectToDB = async () => {
    try {
      setIsConnecting(true);
      setError("");
      const res = await axios.post(`${api.serverUrl}/connect-sql`, sqlConnection);

      setIsConnected(true);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const sendQuery = async () => {
    if (!isConnected) {
      setError("Database is not connected. Please connect first.");
      return;
    }
    if (!prompt || !tableName) {
      setError("Please provide both a table name and a query prompt.");
      return;
    }

    try {
      setIsQuerying(true);
      setError("");
      const res = await axios.post(`${api.serverUrl}/query-sql`, { prompt, tableName });
      setResult(res.data.result);
      setSqlQuery(res.data.sqlQuery);
    } catch (err) {
      setError(err.response?.data?.message || "Query failed");
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Database className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Natural Language SQL Query</h1>
      </div>

      {/* Database Connection Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>Connect to your SQL database to start querying</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Enter SQL host"
              value={sqlConnection.host}
              onChange={(e) => setSqlConnection({ ...sqlConnection, host: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter SQL port"
              value={sqlConnection.port}
              onChange={(e) => setSqlConnection({ ...sqlConnection, port: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter SQL username"
              value={sqlConnection.username}
              onChange={(e) => setSqlConnection({ ...sqlConnection, username: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Enter SQL password"
              value={sqlConnection.password}
              onChange={(e) => setSqlConnection({ ...sqlConnection, password: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter SQL database"
              value={sqlConnection.database}
              onChange={(e) => setSqlConnection({ ...sqlConnection, database: e.target.value })}
            />
            <Button onClick={connectToDB} disabled={isConnected || isConnecting || !sqlConnection.host}>
              {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Connect to DB"}
              {isConnected && <span className="ml-2 text-green-500">✓</span>}
            </Button>
          </div>
        </CardContent>
        {isConnected && (
          <CardFooter>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Connected to database
            </Badge>
          </CardFooter>
        )}
      </Card>

      {/* Query Builder */}
      {isConnected && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Query Builder
            </CardTitle>
            <CardDescription>Describe what you want to query in natural language</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Enter table name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="mb-4"
            />
            <Textarea
              placeholder="Describe the query (e.g., 'Find all users who signed up last month')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={sendQuery} disabled={isQuerying || !prompt || !tableName}>
              {isQuerying ? "Running Query..." : "Run Query"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Query Results */}
      {(sqlQuery || result.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
            <CardDescription>Generated SQL query and results</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="query">
              <TabsList className="mb-4 grid grid-cols-2 bg-gray-100">
                <TabsTrigger value="query">SQL Query</TabsTrigger>
                <TabsTrigger value="results">Results ({result.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="query">
                <pre className="bg-gray-900 text-white p-4 rounded">{sqlQuery || "No query generated"}</pre>
              </TabsContent>
              <TabsContent value="results">
                {result.length > 0 ? (
                  <pre className="bg-gray-900 text-white p-4 rounded">{JSON.stringify(result, null, 2)}</pre>
                ) : (
                  <p className="text-center text-gray-500">No results found.</p>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
