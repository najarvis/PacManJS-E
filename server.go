package main

import (
    "fmt"
    "io/ioutil"
    "net/http"
    "log"
)

func rootHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "text/html")
    w.WriteHeader(http.StatusOK)
    data, err := ioutil.ReadFile("pages/index.html");
    if err != nil {
        panic(err)
    }

    w.Header().Set("Content-Length", fmt.Sprint(len(data)))
    fmt.Fprint(w, string(data))

}

func main() {
    http.HandleFunc("/", rootHandler)
    http.Handle("/game_scripts/", http.StripPrefix("/game_scripts/", http.FileServer(http.Dir("game_scripts"))))
    http.Handle("/res/", http.StripPrefix("/res/", http.FileServer(http.Dir("res"))))
    fmt.Println("Running on localhost:3333");
    log.Fatal(http.ListenAndServe(":3333", nil))
}
