import pygame, sys
from pygame.locals import *
from clases import jugador
from clases import asteroides
from random import randint
from time import time

#variables
Ancho = 480
Alto = 700
maxAsteroides = 5
listAster = []
puntos = 0
colorFuente = (120,200,40)
tiempo_juego = 0

#trigger
jugando = True

#seteo de asteroides
def LoadAster(x, y):
    global listAster
    if len(listAster) < maxAsteroides:
        meteoro = asteroides.Asteroide(x, y)
        listAster.append(meteoro)

#Gamer Over
def GamerOver():
    global jugando
    jugando = False
    for meteoritos in listAster:
        listAster.remove(meteoritos)

# funcion main
def meteoritos():

    pygame.init()
    ventana = pygame.display.set_mode((Ancho,Alto))

    #imagen Fondo
    fondo = pygame.image.load('imagenes/fondo.png').convert()

    #tittle
    pygame.display.set_caption('Meteoritos')

    #objeto jugador
    nave = jugador.Nave()
    contador = 0

    #sonidos
    pygame.mixer.music.load('sonidos/fondo.wav')
    pygame.mixer.music.play(3)
    SonidoColicion = pygame.mixer.Sound('sonidos/colision.aiff')

    #fuente del marcador
    FuenteMarcador = pygame.font.SysFont('Arial', 30)

    posY = 0

    while True:
        pygame.display.update()
        pygame.time.delay(10)

        ventana.fill((0,0,0))
        ventana.blit(fondo, (0, posY))
        ventana.blit(fondo, (0, posY - Alto))
        posY += 1
        if posY >= Alto:
            posY = 0
        nave.Draw(ventana)

        #time
        tiempo = time()
        global tiempo_juego
        tiempo_juego += tiempo - contador
        contador = tiempo

        #marcador
        global puntos
        TextoMarcador = FuenteMarcador.render('Points: '+ str(puntos), 0, colorFuente)
        ventana .blit(TextoMarcador,(0,0))

        #creacion de asteroides
        espera = min(1 - tiempo_juego * 1, 0)
        if tiempo - contador > espera:
            contador = tiempo
            posx = randint(2,478)
            LoadAster(posx, 0)

        #comprobamos lista asteroide
        if len(listAster) > 0:
            for x in listAster:
                if jugando == True:
                    x.Draw(ventana)
                    x.Recorrido()
                if x.rect.top > 700:
                    listAster.remove(x)
                else:
                    if x.rect.colliderect(nave.rect):
                        listAster.remove(x)
                        SonidoColicion.play()
                        # print('Clocion Nave / Meteorito ')
                        nave.vida = False
                        GamerOver()

        # Disparando
        if len(nave.listaDisparo) > 0:
            for x in nave.listaDisparo:
                x.Draw(ventana)
                x.Recorrido()
                if x.rect.top <= -10:
                    nave.listaDisparo.remove(x)
                else:
                    for meteoritos in listAster:
                        if x.rect.colliderect(meteoritos.rect):
                            listAster.remove(meteoritos)
                            nave.listaDisparo.remove(x)
                            puntos += 1
                            # print('Colicion Disparo/ Meteorito')

        nave.Mover()

        for evento in pygame.event.get():
            if evento.type == QUIT:
                pygame.quit()

                sys.exit()

            elif evento.type == pygame.KEYDOWN:
                if jugando == True:
                    if evento.key == K_LEFT:
                        nave.rect.left -= nave.velocidad

                    elif evento.key == K_RIGHT:
                        nave.rect.right += nave.velocidad

                    elif evento.key == K_SPACE:
                        x,y = nave.rect.center
                        nave.Disparar(x,y)
        if jugando == False:
            FuenteGamerOver = pygame.font.SysFont('Arial', 50)
            TextoGameOver = FuenteGamerOver.render('Game Over', 0, (colorFuente))
            ventana.blit(TextoGameOver,(140,350))
            pygame.mixer.music.fadeout(3000)

        pygame.display.update()

#llamada al main
meteoritos()