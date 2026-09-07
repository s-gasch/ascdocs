# Pomysly i plan rozwoju

To nie sa wymagania. To luzne zdania opisujace pomysly i wyznaczajace kierunki rozwoju.
Kolejnosc jest przypadkowa, to nie sa priorytety ani kolejnosc implementacji.

** WAZNE! **
** Istniejaca struktura plikow musi pozostac niezmieniona. To zaszlosc, ktora MUSI byc utrzymywana, bo aplikacja z tego korzysta. **

1. Nowa struktura plikow dla kazdej aplikacji:
- content
  - <app-name>
    - terms-of-use.html - eula - szablon dla EULA specyficzny dla aplikacji. Laduje odpowieni terms-of-use/<lang>.json i renderuje zawartosc HTML
    - privacy-policy.html - szablon dla privacy policy. Laduje odpowiedni privacy-policy/<lang>.json i renderuje zawartosc HTML
    - support.html - dziala podobnie, jak terms of use i privacy policy
    - index.html - strona poczatkowa dla aplikacji. Ona moze miec totalnie inny styl. To strona informacyjno-marketingowa. Opis pozniej.
    - css - katalog na plik css
      - formal.css - wspolny css dla plikow/tresci formalnych (terms-of-use, privacy-policy i support)
      - support.css - rozszerzenie css o specyficzne elementy support, ktorych nie obejmuje formal.css
    - js - katalog na pliki JS
      - formal.js - wspolny JS dla plikow formalnych
      - support.js - rozszezrenie JS o specyficzne elementy, ktorych nie ma w formal.js
    - formal - katalog na formalne dokumenty
      - terms-of-use - katalog na tresci dokumentow **terms of use** (dla kazdego jezyka)
        - <lang>.json - teskt terms-of use dla kazdego jezyka osobno. Tekst jest wrzucany w szablon terms-of-use.html przez js
      - privacy-policy - katalog na tresci dokumentow **privacy policy** (dla kazdego jezyka)
        - <lang>.json - zawartosc dla privacy policy w kazdym jezyku osobno
      - support - katalog na tresci dokumentow **support** (dla kazdego jezyka)
        - <lang>.json - zawartosc dla support w kazdym jezyku osobno
    - img - katalog na obrazki, dopuszcza sie w nim zagniezdzone podkatalogi
    - media - inne media (audio, video) - dopuszcza sie podkatalogi
    - content - katalog tresci dla strony marketignowej
      - <lang>.json - zawartosc dla tresci marketingowejw kazdym jezyku osobno

2. Wszystkie glowne pliki html majaw wykrywac jezyk, w ktorym powinny byc wyswietane. 

3. Pozwol na zmiane jezyka na inny, obslugiwany. 

4. Wybor innego jezyka powinien byc trwale zapamietany (cookies/webstorage)

5. Jesli uzywamy cookies, to mysi byc wyswietlona klauzula informacyjna do zatwierdzenia (jednokrotnie)

6. Strony formalne maja byc minimalistyczne, jasno i wyraznie prezentowac tresc dla uzytkownika. Dopuszcza sie male dyskretne logo aplikacji. Style i kolorystyka spojne.

7. Strona marketingowa ma byc zaprojektowana tak, aby przyciagala uzytkownika.

8. Kazda aplikacja moze miec inny projekt.

9. Strona marketingowa rowniez powinna byc wyswietlana w domyslnym jezyku z mozliwoscia zmiany.