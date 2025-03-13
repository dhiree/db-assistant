"use client"

import { useState } from "react"
import axios from "axios"
import { Database, Server, Search, AlertCircle } from "lucide-react"
import api from "../../api";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NaturalLanguageMongoDBQuery() {
  const [mongoUri, setMongoUri] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [collectionName, setCollectionName] = useState("")
  const [mongoQuery, setMongoQuery] = useState(null)
  const [result, setResult] = useState([])
  const [error, setError] = useState("")
  const [isQuerying, setIsQuerying] = useState(false)

  const connectToDB = async () => {
    try {
      setIsConnecting(true)
      setError("")
      const res = await axios.post(`${api.serverUrl}/connect-db`, { mongoUri });
      console.log("server--->",res)

      if(!res){
        console.log("error")
      }
      setIsConnected(true)
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Connection failed")
    } finally {
      setIsConnecting(false)
    }
  }

  const sendQuery = async () => {
    if (!prompt || !collectionName) {
      setError("Please provide both a collection name and a query prompt")
      return
    }

    try {
      setIsQuerying(true)
      setError("")
      const res = await axios.post(`${api.serverUrl}/query`, { prompt, collectionName })
      setResult(res.data.result)
      setMongoQuery(res.data.mongoQuery)
    } catch (err) {
      setError(err.response?.data?.message || "Query failed")
    } finally {
      setIsQuerying(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Database className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Natural Language MongoDB Query</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>Connect to your MongoDB database to start querying</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Enter your MongoDB URI"
              value={mongoUri}
              onChange={(e) => setMongoUri(e.target.value)}
              className="flex-1"
              disabled={isConnected}
            />
            <Button
              onClick={connectToDB}
              disabled={isConnected || isConnecting || !mongoUri}
              className="whitespace-nowrap"
            >
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

      {isConnected && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Query Builder
            </CardTitle>
            <CardDescription>Describe what you want to query in natural language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="collection" className="block text-sm font-medium mb-2">
                Collection Name
              </label>
              <Input
                id="collection"
                placeholder="Enter collection name"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Query Description
              </label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want to query... (e.g., 'Find all users who signed up in the last month')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={sendQuery}
              disabled={isQuerying || !prompt || !collectionName}
              className="w-full sm:w-auto"
            >
              {isQuerying ? "Running Query..." : "Run Query"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(mongoQuery || result.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Query Results</CardTitle>
            <CardDescription>Generated Db query and results</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="query" className="w-full">
              <TabsList className="mb-4 w-full grid grid-cols-2 bg-slate-100 dark:bg-slate-800">
                <TabsTrigger
                  value="query"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                   Query
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Results ({result.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="query" className="mt-0">
                <div className="bg-slate-900 text-slate-50 rounded-md p-4 overflow-auto shadow-inner">
                  {mongoQuery ? (
                    <div className="font-mono text-sm">
                      <div className="text-blue-300 mb-2">// Generated MongoDB Query</div>
                      <div className="text-green-300">
                        db.{collectionName}.{mongoQuery.operation || "find"}(
                      </div>
                      <div className="pl-6 text-amber-300">
                        {JSON.stringify(mongoQuery.query || mongoQuery, null, 2)}
                      </div>
                      {mongoQuery.projection && (
                        <>
                          <div className="pl-4 text-slate-300">,</div>
                          <div className="pl-6 text-pink-300">{JSON.stringify(mongoQuery.projection, null, 2)}</div>
                        </>
                      )}
                      {mongoQuery.options && (
                        <>
                          <div className="pl-4 text-slate-300">,</div>
                          <div className="pl-6 text-purple-300">{JSON.stringify(mongoQuery.options, null, 2)}</div>
                        </>
                      )}
                      <div className="text-green-300">)</div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-400">No query to display</div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="results" className="mt-0">
                <div className="bg-slate-900 text-slate-50 rounded-md p-4 overflow-auto shadow-inner">
                  {result.length > 0 ? (
                    <div className="space-y-3">
                      {result.map((item, index) => (
                        <div
                          key={index}
                          className="bg-slate-800 rounded-md p-4 border-l-4 border-primary hover:translate-x-1 transition-transform mb-4"
                        >
                          {Object.entries(item).map(([key, value]) => (
                            <div key={key} className="flex flex-wrap items-start gap-2 mb-1.5">
                              <span className="font-medium text-emerald-300 min-w-24 text-base">{key}:</span>
                              <span
                                className={`
                                ${typeof value === "number" ? "text-amber-300" : ""}
                                ${typeof value === "boolean" ? "text-purple-300" : ""}
                                ${typeof value === "string" ? "text-sky-300" : ""}
                                ${value === null ? "text-gray-400 italic" : ""}
                                ${Array.isArray(value) ? "text-pink-300" : ""}
                              `}
                              >
                                {typeof value === "object" && value !== null
                                  ? JSON.stringify(value, null, 2)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-slate-400">No results to display</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

