/************************************************************/
/**
 * Université Sorbonne Paris Nord, Programmation Web
 * Auteurs                       : Étienne André
 * Création                      : 2023/12/11
 * Dernière modification         : 2024/04/02
 */
/************************************************************/

"use strict";

/************************************************************/
/* Constantes */
/************************************************************/
const Direction = { Nord: "N", Sud: "S", Est: "E", Ouest: "O" };

/*------------------------------------------------------------*/
// Dimensions du plateau
/*------------------------------------------------------------*/

// Nombre de cases par défaut du simulateur
const LARGEUR_PLATEAU = 30;
const HAUTEUR_PLATEAU = 15;

// Dimensions des cases par défaut en pixels
const LARGEUR_CASE = 35;
const HAUTEUR_CASE = 40;

/*------------------------------------------------------------*/
// Types des cases
/*------------------------------------------------------------*/
class Type_de_case {
    static Foret = new Type_de_case("foret");

    static Eau = new Type_de_case("eau");

    static Rail_horizontal = new Type_de_case("rail horizontal");

    static Rail_vertical = new Type_de_case("rail vertical");

    // NOTE: faisant la jonction de horizontal à vertical en allant vers la droite puis vers le haut (ou de vertical vers horizontal en allant de bas vers gauche)
    static Rail_droite_vers_haut = new Type_de_case("rail droite vers haut");

    // NOTE: faisant la jonction de vertical à horizontal en allant vers le haut puis vers la droite (ou de horizontal à vertical en allant de gauche vers le bas)
    static Rail_haut_vers_droite = new Type_de_case("rail haut vers droite");

    // NOTE: faisant la jonction de horizontal à vertical en allant vers la droite puis vers le bas (ou de vertical vers horizontal en allant de haut vers gauche)
    static Rail_droite_vers_bas = new Type_de_case("rail droite vers bas");

    // NOTE: faisant la jonction de vertical à horizontal en allant vers le bas puis vers la droite (ou de horizontal à vertical en allant de gauche vers le haut)
    static Rail_bas_vers_droite = new Type_de_case("rail bas vers droite");

    constructor(nom) {
        this.nom = nom;
    }
}

/*------------------------------------------------------------*/
// Images et Audio
/*------------------------------------------------------------*/
const IMAGE_EAU = new Image();
IMAGE_EAU.src = "images/eau.png";

const IMAGE_FORET = new Image();
IMAGE_FORET.src = "images/foret.png";

const IMAGE_LOCO = new Image();
IMAGE_LOCO.src = "images/locomotive.png";

const IMAGE_RAIL_HORIZONTAL = new Image();
IMAGE_RAIL_HORIZONTAL.src = "images/rail-horizontal.png";

const IMAGE_RAIL_VERTICAL = new Image();
IMAGE_RAIL_VERTICAL.src = "images/rail-vertical.png";

const IMAGE_RAIL_BAS_VERS_DROITE = new Image();
IMAGE_RAIL_BAS_VERS_DROITE.src = "images/rail-bas-vers-droite.png";

const IMAGE_RAIL_DROITE_VERS_BAS = new Image();
IMAGE_RAIL_DROITE_VERS_BAS.src = "images/rail-droite-vers-bas.png";

const IMAGE_RAIL_DROITE_VERS_HAUT = new Image();
IMAGE_RAIL_DROITE_VERS_HAUT.src = "images/rail-droite-vers-haut.png";

const IMAGE_RAIL_HAUT_VERS_DROITE = new Image();
IMAGE_RAIL_HAUT_VERS_DROITE.src = "images/rail-haut-vers-droite.png";

const IMAGE_WAGON = new Image();
IMAGE_WAGON.src = "images/wagon.png";

const IMAGE_TGV = new Image();
IMAGE_TGV.src = "images/TGV.png";

const IMAGE_RAME = new Image();
IMAGE_RAME.src = "images/rame.png";

const IMAGE_RAME_RER = new Image();
IMAGE_RAME_RER.src = "images/rer_b_rame.png";

const IMAGE_RER_B = new Image();
IMAGE_RER_B.src = "images/rer_b.png";

//permet de connaitre la taille du gif et donc la taille des sprits du gif
const EXPLOSION_GIF = new Image();
EXPLOSION_GIF.src = "gif/explosion.gif";

//va nous permettre de faire l'animation de l'explosion
const SPRIT_EXPLOSION = new Image();
SPRIT_EXPLOSION.src = "gif/sprit-explosion.png";

const AUDIO_LOCO = new Audio();
AUDIO_LOCO.src = "audio/tchou_tchou.mp3";

const AUDIO_TGV = new Audio();
AUDIO_TGV.src = "audio/tgv.mp3";

const AUDIO_RER_B = new Audio();
AUDIO_RER_B.src = "audio/rer_b.mp3";

const AUDIO_SNCF = new Audio();
AUDIO_SNCF.src = "audio/sncf.mp3";

const AUDIO_EXPLOSION = new Audio();
AUDIO_EXPLOSION.src = "audio/explosion.mp3";

const AUDIO_EAU = new Audio();
AUDIO_EAU.src = "audio/eau.mp3";

const AUDIO_TERRE = new Audio();
AUDIO_TERRE.src = "audio/terre.mp3";

/************************************************************/
// Variables globales
/************************************************************/
let pause = false; //booleen qui dit si le bouton pause est appuié ou non
let lesTrains = []; //tableau qui contient tout les trains sur le plateau
//let id_interval = undefined; //l'indentifiant de setInterval
let idTrain = 0; //les identifiants d'un train
const contexte = document.getElementById("simulateur").getContext("2d");

/************************************************************/
/* Classes */
/************************************************************/
class Simulateur {
    static mettreEnPauseSimulation() {
        lesTrains.forEach((train) => {
            train.arreter();
        });
    }

    static lancerSimulation(plateau) {
        lesTrains.forEach((train) => {
            train.demarre(plateau);
        });
        dessine_plateau(plateau);
    }
}

class Deplacement {
    //syntaxe des methodes: move(Direction du train)
    //tout les "default" enlèvent le train passer en argument car il va alors subir une colision avec une case d'eau, de forêts ou d'autre rails
    static moveNord(plateau, train) {
        switch (plateau.cases[train.pos_x][train.pos_y - 1]) {
            case Type_de_case.Rail_haut_vers_droite:
                train.direction = Direction.Est;
                train.pos_y--;
                break;

            case Type_de_case.Rail_droite_vers_bas:
                train.direction = Direction.Ouest;
                train.pos_y--;
                break;

            case Type_de_case.Rail_vertical:
                train.pos_y--;
                break;

            default:
                enleverTrain(plateau, train);
                break;
        }
    }

    static moveSud(plateau, train) {
        switch (plateau.cases[train.pos_x][train.pos_y + 1]) {
            case Type_de_case.Rail_droite_vers_haut:
                train.direction = Direction.Ouest;
                train.pos_y++;
                break;

            case Type_de_case.Rail_bas_vers_droite:
                train.direction = Direction.Est;
                train.pos_y++;
                break;

            case Type_de_case.Rail_vertical:
                train.pos_y++;
                break;

            default:
                enleverTrain(plateau, train);
                break;
        }
    }

    static moveEst(plateau, train) {
        switch (plateau.cases[train.pos_x + 1][train.pos_y]) {
            case Type_de_case.Rail_droite_vers_haut:
                train.direction = Direction.Nord;
                train.pos_x++;
                break;

            case Type_de_case.Rail_droite_vers_bas:
                train.direction = Direction.Sud;
                train.pos_x++;
                break;

            case Type_de_case.Rail_horizontal:
                train.pos_x++;
                break;

            default:
                enleverTrain(plateau, train);
                break;
        }
    }

    static moveOuest(plateau, train) {
        switch (plateau.cases[train.pos_x - 1][train.pos_y]) {
            case Type_de_case.Rail_bas_vers_droite:
                train.direction = Direction.Nord;
                train.pos_x--;
                break;

            case Type_de_case.Rail_haut_vers_droite:
                train.direction = Direction.Sud;
                train.pos_x--;
                break;

            case Type_de_case.Rail_horizontal:
                train.pos_x--;
                break;

            default:
                enleverTrain(plateau, train);
                break;
        }
    }

    //le if avant le switch permet de vérifier si le train ne soritira pas du plateu aprés un déplacement
    static move(plateau, train) {
        if (
            train.pos_y - 1 < 0 ||
            train.pos_y + 1 >= plateau.hauteur ||
            train.pos_x - 1 < 0 ||
            train.pos_x + 1 >= plateau.largeur
        ) {
            enleverTrain(plateau, train);
            return;
        }

        if (train instanceof RerB && Math.random() < 0.15) {
            train.tombeEnPanne(plateau);
            return;
        }

        switch (train.direction) {
            case Direction.Nord:
                Deplacement.moveNord(plateau, train);
                break;

            case Direction.Sud:
                Deplacement.moveSud(plateau, train);
                break;

            case Direction.Est:
                Deplacement.moveEst(plateau, train);
                break;

            case Direction.Ouest:
                Deplacement.moveOuest(plateau, train);
                break;

            default:
                break;
        }

        //on déplace les wagons ou les rames
        if (train instanceof Train) {
            train.wagon.forEach((e) => {
                Deplacement.move(plateau, e);
            });
        }

        if (train instanceof Tgv) {
            train.rame.forEach((e) => {
                Deplacement.move(plateau, e);
            });
        }

        if (train instanceof RerB) {
            train.rame.forEach((e) => {
                Deplacement.move(plateau, e);
            });
        }

        if (
            (train instanceof Train ||
                train instanceof Tgv ||
                train instanceof RerB) &&
            Math.random() < 0.05
        )
            train.playSound();
    }

    static verifierColisionTrain(plateau, train) {
        if (lesTrains.length <= 1) {
            return;
        }

        lesTrains.forEach((e) => {
            //colision entre 2 locomotives
            if (
                !train.equals(e) &&
                train.pos_x === e.pos_x &&
                train.pos_y === e.pos_y
            ) {
                explosion(train.pos_x, train.pos_y, plateau);
                enleverTrain(plateau, train);
                enleverTrain(plateau, e);
            }

            //colision entre une locomotive et un wagon
            if (e instanceof Train)
                e.wagon.forEach((w) => {
                    if (train.pos_x === w.pos_x && train.pos_y === w.pos_y) {
                        explosion(train.pos_x, train.pos_y, plateau);
                        enleverTrain(plateau, train);
                        enleverTrain(plateau, e);
                    }
                });

            if (e instanceof Tgv)
                e.rame.forEach((w) => {
                    if (train.pos_x === w.pos_x && train.pos_y === w.pos_y) {
                        explosion(train.pos_x, train.pos_y, plateau);
                        enleverTrain(plateau, train);
                        enleverTrain(plateau, e);
                    }
                });

            if (e instanceof RerB)
                e.rame.forEach((w) => {
                    if (train.pos_x === w.pos_x && train.pos_y === w.pos_y) {
                        explosion(train.pos_x, train.pos_y, plateau);
                        enleverTrain(plateau, train);
                        enleverTrain(plateau, e);
                    }
                });
        });
    }
}

class Wagon {
    constructor(x, y) {
        this.direction = Direction.Est;
        this.pos_x = x;
        this.pos_y = y;
    }

    dessinWagon() {
        // -10 pour que le wagon soit alignée avec les rails
        contexte.drawImage(
            IMAGE_WAGON,
            this.pos_x * LARGEUR_CASE,
            this.pos_y * HAUTEUR_CASE - 10,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );
    }
}

class Train {
    constructor(x, y, num_wagon) {
        this.id_interval = undefined;
        this.vitesse = 2; //2 coups par secondes
        this.id = idTrain++;
        this.pos_x = x;
        this.pos_y = y;
        this.direction = Direction.Est;
        this.wagon = [];

        for (let i = 1; i <= num_wagon; i++)
            this.wagon.push(new Wagon(x - i, y));

        lesTrains.push(this);
    }

    playSound() {
        AUDIO_LOCO.play();
    }

    static demanderVitesse() {
        let v;

        do {
            v = parseInt(
                window.prompt(
                    "Quelle est la vitesse du train (en coups par secondes) ?"
                )
            );

            if (v > 3) window.alert("Votre train n'est pas un TGV");
            if (v < 1) window.alert("Votre train n'est pas un escargot");
            if (isNaN(v)) window.alert("Entrez un nombre valide");
        } while (v < 1 || v > 3 || isNaN(v));

        return v;
    }

    demarre(plateau) {
        this.id_interval = setInterval(() => {
            Deplacement.verifierColisionTrain(plateau, this);
            Deplacement.move(plateau, this);
            dessine_plateau(plateau);
        }, 1000 / this.vitesse);
    }

    arreter() {
        clearInterval(this.id_interval);
    }

    dessinTrain() {
        // -10 pour que la locomotive soit alignée avec les rails
        contexte.drawImage(
            IMAGE_LOCO,
            this.pos_x * LARGEUR_CASE,
            this.pos_y * HAUTEUR_CASE - 10,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );

        this.wagon.forEach((e) => {
            e.dessinWagon(contexte);
        });
    }

    equals(train) {
        return this.id === train.id;
    }
}

class RameTGV {
    constructor(x, y) {
        this.direction = Direction.Est;
        this.pos_x = x;
        this.pos_y = y;
    }

    dessinRame() {
        // -10 pour que la rame soit alignée avec les rails
        contexte.drawImage(
            IMAGE_RAME,
            this.pos_x * LARGEUR_CASE,
            this.pos_y * HAUTEUR_CASE - 10,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );
    }
}

class Tgv {
    constructor(x, y) {
        this.id_interval = undefined;
        this.vitesse = 4; //4 coups par secondes
        this.id = idTrain++;
        this.pos_x = x;
        this.pos_y = y;
        this.direction = Direction.Est;
        this.rame = [
            new RameTGV(x - 1, y),
            new RameTGV(x - 2, y),
            new RameTGV(x - 3, y),
        ];

        lesTrains.push(this);
    }

    playSound() {
        AUDIO_TGV.play();
    }

    static demanderVitesse() {
        let v;

        do {
            v = parseInt(
                window.prompt(
                    "Quelle est la vitesse du TGV (en coups par secondes) ?"
                )
            );

            if (v > 6) window.alert("Votre TGV n'est pas une fusée");
            if (v < 4) window.alert("Votre TGV n'est pas un train");
            if (isNaN(v)) window.alert("Entrez un nombre valide");
        } while (v < 4 || v > 6 || isNaN(v));

        return v;
    }

    demarre(plateau) {
        this.id_interval = setInterval(() => {
            Deplacement.verifierColisionTrain(plateau, this);
            Deplacement.move(plateau, this);
            dessine_plateau(plateau);
        }, 1000 / this.vitesse);
    }

    arreter() {
        clearInterval(this.id_interval);
    }

    dessinTGV() {
        // -10 pour que le TGV soit alignée avec les rails
        contexte.drawImage(
            IMAGE_TGV,
            this.pos_x * LARGEUR_CASE,
            this.pos_y * HAUTEUR_CASE - 10,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );

        this.rame.forEach((e) => {
            e.dessinRame(contexte);
        });
    }

    equals(train) {
        return this.id === train.id;
    }
}

class RameRer {
    constructor(x, y) {
        this.direction = Direction.Est;
        this.pos_x = x;
        this.pos_y = y;
    }

    dessinRame() {
        // -10 pour que la rame soit alignée avec les rails
        contexte.drawImage(
            IMAGE_RAME_RER,
            this.pos_x * LARGEUR_CASE,
            this.pos_y * HAUTEUR_CASE - 10,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );
    }
}

class RerB {
    constructor(x, y) {
        this.id_interval = undefined;
        this.vitesse = 2; //2 coups par secondes
        this.id = idTrain++;
        this.pos_x = x;
        this.pos_y = y;
        this.direction = Direction.Est;
        this.rame = [
            new RameRer(x - 1, y),
            new RameRer(x - 2, y),
            new RameRer(x - 3, y),
        ];

        lesTrains.push(this);
    }

    playSound() {
        AUDIO_RER_B.play();
    }

    static demanderVitesse() {
        let v;

        do {
            v = parseInt(
                window.prompt(
                    "Quelle est la vitesse du RER B (en coups par secondes) ?"
                )
            );

            if (v > 3) window.alert("Votre RER B n'est pas un TGV");
            if (v < 1) window.alert("Votre RER B n'est pas un escargot");
            if (isNaN(v)) window.alert("Entrez un nombre valide");
        } while (v < 1 || v > 3 || isNaN(v));

        return v;
    }

    demarre(plateau) {
        this.id_interval = setInterval(() => {
            Deplacement.verifierColisionTrain(plateau, this);
            Deplacement.move(plateau, this);
            dessine_plateau(plateau);
        }, 1000 / this.vitesse);
    }

    arreter() {
        clearInterval(this.id_interval);
    }

    dessinRerB() {
        // -10 pour que le RerB soit alignée avec les rails
        contexte.drawImage(
            IMAGE_RER_B,
            this.pos_x * LARGEUR_CASE,
            this.pos_y * HAUTEUR_CASE - 10,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );

        this.rame.forEach((e) => {
            e.dessinRame(contexte);
        });
    }

    tombeEnPanne(plateau) {
        AUDIO_SNCF.play();
        this.arreter();

        setTimeout(() => {
            this.demarre(plateau);
        }, 3000);
    }

    equals(train) {
        return this.id === train.id;
    }
}

/*------------------------------------------------------------*/
// Plateau
/*------------------------------------------------------------*/

class Plateau {
    /* Constructeur d'un plateau vierge */
    constructor() {
        this.largeur = LARGEUR_PLATEAU;
        this.hauteur = HAUTEUR_PLATEAU;

        // État des cases du plateau
        // NOTE: tableau de colonnes, chaque colonne étant elle-même un tableau de cases (beaucoup plus simple à gérer avec la syntaxe case[x][y] pour une coordonnée (x,y))
        this.cases = [];
        for (let x = 0; x < this.largeur; x++) {
            this.cases[x] = [];
            for (let y = 0; y < this.hauteur; y++) {
                this.cases[x][y] = Type_de_case.Foret;
            }
        }
    }

    constructionMonde(idElem, plateau, plateau_x, plateau_y) {
        switch (idElem) {
            case "bouton_rail_bas_vers_droite":
                plateau.cases[plateau_x][plateau_y] =
                    Type_de_case.Rail_bas_vers_droite;
                break;

            case "bouton_rail_droite_vers_bas":
                plateau.cases[plateau_x][plateau_y] =
                    Type_de_case.Rail_droite_vers_bas;
                break;

            case "bouton_rail_haut_vers_droite":
                plateau.cases[plateau_x][plateau_y] =
                    Type_de_case.Rail_haut_vers_droite;
                break;

            case "bouton_rail_droite_vers_haut":
                plateau.cases[plateau_x][plateau_y] =
                    Type_de_case.Rail_droite_vers_haut;
                break;

            case "bouton_rail_vertical":
                plateau.cases[plateau_x][plateau_y] =
                    Type_de_case.Rail_vertical;
                break;

            case "bouton_rail_horizontal":
                plateau.cases[plateau_x][plateau_y] =
                    Type_de_case.Rail_horizontal;
                break;

            case "bouton_eau":
                plateau.cases[plateau_x][plateau_y] = Type_de_case.Eau;
                AUDIO_EAU.play();
                break;

            case "bouton_foret":
                plateau.cases[plateau_x][plateau_y] = Type_de_case.Foret;
                AUDIO_TERRE.play();
                break;

            case "bouton_TGV":
                this.ajouterTGV(plateau, plateau_x, plateau_y);
                break;

            case "bouton_RER_B":
                this.ajouterRERB(plateau, plateau_x, plateau_y);
                break;

            case "bouton_train_1":
            case "bouton_train_2":
            case "bouton_train_4":
            case "bouton_train_6":
                let num_wagon = parseInt(idElem.charAt(idElem.length - 1)) - 1;

                this.ajouterTrain(num_wagon, plateau, plateau_x, plateau_y);
                break;

            default:
                break;
        }
        dessine_plateau(plateau);

        if (!pause) Simulateur.lancerSimulation(plateau);
    }

    ajouterTGV(plateau, plateau_x, plateau_y) {
        //si on ne clique pas sur un rail horizontal on renvoie null
        if (
            plateau.cases[plateau_x][plateau_y] !== Type_de_case.Rail_horizontal
        )
            return false;

        for (let i = plateau_x; i >= plateau_x - 3; i--)
            if (
                i < 0 ||
                i > plateau.largeur ||
                plateau.cases[i][plateau_y] !== Type_de_case.Rail_horizontal
            )
                return false;

        let tgv = new Tgv(plateau_x, plateau_y);
        tgv.vitesse = Tgv.demanderVitesse();

        return true;
    }

    ajouterTrain(num_wagon, plateau, plateau_x, plateau_y) {
        //si on ne clique pas sur un rail horizontal on renvoie null
        if (
            plateau.cases[plateau_x][plateau_y] !== Type_de_case.Rail_horizontal
        )
            return false;

        for (let i = plateau_x; i >= plateau_x - num_wagon; i--)
            if (
                i < 0 ||
                i > plateau.largeur ||
                plateau.cases[i][plateau_y] !== Type_de_case.Rail_horizontal
            )
                return false;

        let train = new Train(plateau_x, plateau_y, num_wagon);
        train.vitesse = Train.demanderVitesse();

        return true;
    }

    ajouterRERB(plateau, plateau_x, plateau_y) {
        //si on ne clique pas sur un rail horizontal on renvoie null
        if (
            plateau.cases[plateau_x][plateau_y] !== Type_de_case.Rail_horizontal
        )
            return false;

        for (let i = plateau_x; i >= plateau_x - 3; i--)
            if (
                i < 0 ||
                i > plateau.largeur ||
                plateau.cases[i][plateau_y] !== Type_de_case.Rail_horizontal
            )
                return false;

        let rerB = new RerB(plateau_x, plateau_y);
        rerB.vitesse = RerB.demanderVitesse();

        return true;
    }
}

/************************************************************/
// Méthodes
/************************************************************/

function image_of_case(type_de_case) {
    switch (type_de_case) {
        case Type_de_case.Foret:
            return IMAGE_FORET;
        case Type_de_case.Eau:
            return IMAGE_EAU;
        case Type_de_case.Rail_horizontal:
            return IMAGE_RAIL_HORIZONTAL;
        case Type_de_case.Rail_vertical:
            return IMAGE_RAIL_VERTICAL;
        case Type_de_case.Rail_droite_vers_haut:
            return IMAGE_RAIL_DROITE_VERS_HAUT;
        case Type_de_case.Rail_haut_vers_droite:
            return IMAGE_RAIL_HAUT_VERS_DROITE;
        case Type_de_case.Rail_droite_vers_bas:
            return IMAGE_RAIL_DROITE_VERS_BAS;
        case Type_de_case.Rail_bas_vers_droite:
            return IMAGE_RAIL_BAS_VERS_DROITE;
    }
}

function dessine_case(plateau, x, y) {
    const la_case = plateau.cases[x][y];

    let image_a_afficher = image_of_case(la_case);

    if (image_a_afficher.src.includes("rail")) {
        contexte.fillStyle = "gray";
        contexte.fillRect(
            x * LARGEUR_CASE,
            y * HAUTEUR_CASE,
            LARGEUR_CASE,
            HAUTEUR_CASE
        );
        contexte.fill();
    }

    contexte.drawImage(
        image_a_afficher,
        x * LARGEUR_CASE,
        y * HAUTEUR_CASE,
        LARGEUR_CASE,
        HAUTEUR_CASE
    );
}

function dessine_plateau(plateau) {
    // Dessin du plateau avec paysages et rails
    for (let x = 0; x < plateau.largeur; x++) {
        for (let y = 0; y < plateau.hauteur; y++) {
            dessine_case(plateau, x, y);
        }
    }

    lesTrains.forEach((e) => {
        if (e instanceof Train) e.dessinTrain();
        if (e instanceof Tgv) e.dessinTGV();
        if (e instanceof RerB) e.dessinRerB();
    });
}

function enleverTrain(plateau, train) {
    Simulateur.mettreEnPauseSimulation();

    let indice_train_a_sup = lesTrains.indexOf(train);
    lesTrains.splice(indice_train_a_sup, 1);

    Simulateur.lancerSimulation(plateau);
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function explosion(x, y, plateau) {
    let height = EXPLOSION_GIF.height,
        width = EXPLOSION_GIF.width;
    let colonne = 0,
        ligne = 0; //correspond au numéro de ligne et de colonne dans sprit-explosion.png

    AUDIO_EXPLOSION.play();

    // 24 =  nombre de sprit dans "gif/sprit-gif.png"
    for (let i = 0; i < 24; i++) {
        // 5 = nombre de sprit dans une ligne de "gif/sprit-gif.png"
        if (colonne === 5) {
            colonne = 0;
            ligne++;
        }

        //pour enlever le dernier sprit dessiné
        dessine_plateau(plateau);

        //-LARGEUR_CASE*0.75 car la largeur de l'explosion est 75% plus grande que les cases du plateau et je veux que l'explosion ce lance au meme coordonnée que le train
        //meme chose pour -HAUTEUR_CASE*0.75
        contexte.drawImage(
            SPRIT_EXPLOSION,
            width * colonne,
            height * ligne,
            width,
            height,
            x * LARGEUR_CASE - LARGEUR_CASE * 0.75,
            y * HAUTEUR_CASE - HAUTEUR_CASE * 0.75,
            LARGEUR_CASE * 1.75,
            HAUTEUR_CASE * 1.75
        );

        colonne++;

        await sleep(50);
    }

    //pour enlever le dernier sprit dessiné
    dessine_plateau(plateau);
}

/************************************************************/
// Auditeurs
/************************************************************/

function majBoutons(boutons, boutonActive) {
    boutons.forEach((boutton) => {
        boutton.disabled = false;
        boutton.style.opacity = "1";
    });

    boutonActive.disabled = true;
    boutonActive.style.opacity = "0.5";
    return boutonActive;
}

function canvasListener(event, plateau, bouton_courant, idElem2add) {
    if (bouton_courant === undefined) return;

    //on récupère les coordonée ou l'utilisateur a appuyé sur le canvas
    let plateau_x = parseInt(event.offsetX / LARGEUR_CASE);
    let plateau_y = parseInt(event.offsetY / HAUTEUR_CASE);
    plateau.constructionMonde(idElem2add, plateau, plateau_x, plateau_y);
    bouton_courant.removeAttribute("disabled");
    bouton_courant.style.opacity = "1";

    return bouton_courant;
}

function pauseListener(bouton, plateau) {
    //on a appuyé sur pause donc on change la valeur de pause
    pause = !pause;

    if (pause) {
        bouton.style.backgroundColor = "gray";
        bouton.style.border = "none";
        Simulateur.mettreEnPauseSimulation();
    } else {
        bouton.style.backgroundColor = "";
        bouton.style.border = "";
        Simulateur.lancerSimulation(plateau);
    }
}

/************************************************************/
// Plateau de jeu initial
/************************************************************/

function cree_plateau_initial(plateau) {
    // Circuit
    plateau.cases[12][7] = Type_de_case.Rail_horizontal;
    plateau.cases[13][7] = Type_de_case.Rail_horizontal;
    plateau.cases[14][7] = Type_de_case.Rail_horizontal;
    plateau.cases[15][7] = Type_de_case.Rail_horizontal;
    plateau.cases[16][7] = Type_de_case.Rail_horizontal;
    plateau.cases[17][7] = Type_de_case.Rail_horizontal;
    plateau.cases[18][7] = Type_de_case.Rail_horizontal;
    plateau.cases[19][7] = Type_de_case.Rail_droite_vers_haut;
    plateau.cases[19][6] = Type_de_case.Rail_vertical;
    plateau.cases[19][5] = Type_de_case.Rail_droite_vers_bas;
    plateau.cases[12][5] = Type_de_case.Rail_horizontal;
    plateau.cases[13][5] = Type_de_case.Rail_horizontal;
    plateau.cases[14][5] = Type_de_case.Rail_horizontal;
    plateau.cases[15][5] = Type_de_case.Rail_horizontal;
    plateau.cases[16][5] = Type_de_case.Rail_horizontal;
    plateau.cases[17][5] = Type_de_case.Rail_horizontal;
    plateau.cases[18][5] = Type_de_case.Rail_horizontal;
    plateau.cases[11][5] = Type_de_case.Rail_haut_vers_droite;
    plateau.cases[11][6] = Type_de_case.Rail_vertical;
    plateau.cases[11][7] = Type_de_case.Rail_bas_vers_droite;

    // Segment isolé à gauche
    plateau.cases[0][7] = Type_de_case.Rail_horizontal;
    plateau.cases[1][7] = Type_de_case.Rail_horizontal;
    plateau.cases[2][7] = Type_de_case.Rail_horizontal;
    plateau.cases[3][7] = Type_de_case.Rail_horizontal;
    plateau.cases[4][7] = Type_de_case.Rail_horizontal;
    plateau.cases[5][7] = Type_de_case.Eau;
    plateau.cases[6][7] = Type_de_case.Rail_horizontal;
    plateau.cases[7][7] = Type_de_case.Rail_horizontal;

    // Plan d'eau
    for (let x = 22; x <= 27; x++) {
        for (let y = 2; y <= 5; y++) {
            plateau.cases[x][y] = Type_de_case.Eau;
        }
    }

    // Segment isolé à droite
    plateau.cases[22][8] = Type_de_case.Rail_horizontal;
    plateau.cases[23][8] = Type_de_case.Rail_horizontal;
    plateau.cases[24][8] = Type_de_case.Rail_horizontal;
    plateau.cases[25][8] = Type_de_case.Rail_horizontal;
    plateau.cases[26][8] = Type_de_case.Rail_bas_vers_droite;
    plateau.cases[27][8] = Type_de_case.Rail_horizontal;
    plateau.cases[28][8] = Type_de_case.Rail_horizontal;
    plateau.cases[29][8] = Type_de_case.Rail_horizontal;

    // TCHOU
    plateau.cases[3][10] = Type_de_case.Eau;
    plateau.cases[4][10] = Type_de_case.Eau;
    plateau.cases[4][11] = Type_de_case.Eau;
    plateau.cases[4][12] = Type_de_case.Eau;
    plateau.cases[4][13] = Type_de_case.Eau;
    plateau.cases[4][13] = Type_de_case.Eau;
    plateau.cases[5][10] = Type_de_case.Eau;

    plateau.cases[7][10] = Type_de_case.Eau;
    plateau.cases[7][11] = Type_de_case.Eau;
    plateau.cases[7][12] = Type_de_case.Eau;
    plateau.cases[7][13] = Type_de_case.Eau;
    plateau.cases[8][10] = Type_de_case.Eau;
    plateau.cases[9][10] = Type_de_case.Eau;
    plateau.cases[8][13] = Type_de_case.Eau;
    plateau.cases[9][13] = Type_de_case.Eau;

    plateau.cases[11][10] = Type_de_case.Eau;
    plateau.cases[11][11] = Type_de_case.Eau;
    plateau.cases[11][12] = Type_de_case.Eau;
    plateau.cases[11][13] = Type_de_case.Eau;
    plateau.cases[12][11] = Type_de_case.Eau;
    plateau.cases[13][10] = Type_de_case.Eau;
    plateau.cases[13][11] = Type_de_case.Eau;
    plateau.cases[13][12] = Type_de_case.Eau;
    plateau.cases[13][13] = Type_de_case.Eau;

    plateau.cases[15][10] = Type_de_case.Eau;
    plateau.cases[15][11] = Type_de_case.Eau;
    plateau.cases[15][12] = Type_de_case.Eau;
    plateau.cases[15][13] = Type_de_case.Eau;
    plateau.cases[16][10] = Type_de_case.Eau;
    plateau.cases[16][13] = Type_de_case.Eau;
    plateau.cases[17][10] = Type_de_case.Eau;
    plateau.cases[17][11] = Type_de_case.Eau;
    plateau.cases[17][12] = Type_de_case.Eau;
    plateau.cases[17][13] = Type_de_case.Eau;

    plateau.cases[19][10] = Type_de_case.Eau;
    plateau.cases[19][11] = Type_de_case.Eau;
    plateau.cases[19][12] = Type_de_case.Eau;
    plateau.cases[19][13] = Type_de_case.Eau;
    plateau.cases[20][13] = Type_de_case.Eau;
    plateau.cases[21][10] = Type_de_case.Eau;
    plateau.cases[21][11] = Type_de_case.Eau;
    plateau.cases[21][12] = Type_de_case.Eau;
    plateau.cases[21][13] = Type_de_case.Eau;
}

/************************************************************/
// Fonction principale
/************************************************************/
function tchou() {
    console.log("Tchou, attention au départ !");
    /*------------------------------------------------------------*/
    // Variables DOM
    /*------------------------------------------------------------*/
    const boutons = document.querySelectorAll("button");
    const canvas = document.getElementById("simulateur");

    // Création du plateau
    let plateau = new Plateau();
    cree_plateau_initial(plateau);

    // Dessine le plateau
    dessine_plateau(plateau);

    //id de l'element a ajouter dans le plateau avec le bouton qui correspond
    let bouton_courant, idElem2add;

    //tout les boutons sauf "pause"
    for (let i = 0; i < boutons.length - 1; i++) {
        boutons[i].addEventListener("click", () => {
            Simulateur.mettreEnPauseSimulation();
            idElem2add = boutons[i].getAttribute("id");
            bouton_courant = majBoutons(boutons, boutons[i]);
        });
    }

    //bouton "pause"
    boutons[boutons.length - 1].addEventListener("click", () => {
        pauseListener(boutons[boutons.length - 1], plateau);
    });

    canvas.addEventListener("click", (e) => {
        bouton_courant = canvasListener(e, plateau, bouton_courant, idElem2add);
        idElem2add = undefined;
    });
}

/************************************************************/
// Programme principal
/************************************************************/
// NOTE: rien à modifier ici !
window.addEventListener("load", () => {
    // Appel à la fonction principale
    tchou();
});
