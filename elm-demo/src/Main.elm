module Main exposing (Model, Msg(..), Priority(..), TaskModel, VariablesModel, apVars, init, main, update, view)

import Browser
import Html exposing (Html, button, div, input, li, text, ul)
import Html.Attributes exposing (class, placeholder, type_, value)
import Html.Events exposing (onClick, onInput)


main : Program () Model Msg
main =
    Browser.sandbox { init = init, update = update, view = view }


type Priority
    = High
    | Normal
    | Low


type alias TaskModel =
    { id : Int
    , title : String
    , priotiry : Priority
    , isDone : Bool
    }


type alias Model =
    { tasks : List TaskModel
    , inputContent : String
    , nextId : Int
    }


init : Model
init =
    { tasks = [], inputContent = "", nextId = 1 }


type Msg
    = AddTask TaskModel
    | RemoveTask Int
    | Change String


update : Msg -> Model -> Model
update msg model =
    case msg of
        AddTask task ->
            { model
                | tasks = task :: model.tasks
                , nextId = model.nextId + 1
                , inputContent = ""
            }

        RemoveTask taskId ->
            { model | tasks = List.filter (\task -> task.id /= taskId) model.tasks }

        Change newContent ->
            { model | inputContent = newContent }


type alias VariablesModel =
    { buttonStyle : String }


apVars : VariablesModel
apVars =
    { buttonStyle = "bg-white px-4 text-sm py-1 text-black font-medium rounded-xl active:scale-95 cursor-pointer"
    }


view : Model -> Html Msg
view model =
    div [ class "w-sm flex flex-col gap-3 h-96 p-2 rounded-xl border-white/10 border" ]
        [ div [ class "inline-flex items-center w-full justify-between border-b border-white/10 pb-2" ]
            [ input
                [ placeholder "Task name..."
                , value model.inputContent
                , onInput Change
                ]
                []
            , button
                [ type_ "button"
                , class apVars.buttonStyle
                , onClick
                    (AddTask
                        { id = model.nextId, title = model.inputContent, priotiry = Normal, isDone = False }
                    )
                ]
                [ text "Add Task" ]
            ]
        , ul [ class "overflow-x-hidden overflow-y-auto" ]
            (List.map
                (\item ->
                    li
                        [ class "border p-2 rounded-lg flex justify-between items-center border-white/10" ]
                        [ div []
                            [ text (String.fromInt item.id ++ ". " ++ item.title)
                            ]
                        , button [ class "size-6 rounded-full bg-white text-black", onClick (RemoveTask item.id) ]
                            [ text "x" ]
                        ]
                )
                model.tasks
            )
        ]
