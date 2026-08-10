# Luzny opis projektu

1. To nie jest aplikacja 
2. Projekt zawiera statyczne pliki HTML, CSS i JS
3. Projekt moze tez zawierac elementy graficzne (PNG, JPG) oraz video
4. Celem projektu jest ujednolicenie przygotowywanie dokumentow dla AppStore Connect:
- Privacy Policy
- Terms of Use (EULA)
- Support
- inne, byc moze specyficzne dla konkretengo projektu
5. W tym projekcie beda trzymane pliki wspolne:
- content/common:
  - CSS
  - JS
  - szablony HTML
- content/
  - specyficzne pliki dla kazdej z aplikacji w folderach odpowiedajacych nazwie aplikacji, np. content/aplikacja1
  - specyficzne pliki dla aplikacji w podziale na jezyki: content/<app-name>/<lang>
6. Punktem wejscia maja byc pliki:
  - content/<app-name>/<lang>/privacy-policy.html
  - content/<app-name>/<lang>/terms-of-use.html
  - content/<app-name>/<lang>/support.html
7. Te pliki powinny zawierac minimalna strukture HTML oraz specyficzna zawartosc wynikajaca w jezyka dla tej aplikacji.
8. Pliki z punktu 8 powinny korzystac z szablonu spacyficznego dla <app-name>:
  - content/<app-name>/template
  - niech template bedzie pojedynczym plikiem lub zestawem plikow (HTML, CSS, JS), ktore wyrenderuja w taki sam sposob dane z plikow z wersjami jezykowymi
9. Renderowanie kontentu ma byc tylko w przegladarce w JS, nic po stronie servera, server hostuje tylko statyczne pliki.
10. W glownym katalogu content/common maja byc ogolne szablony wspolne dla wszystkich aplikacji, zeby zachowac spojnosc stylu.
11. Pozwol na definiowanie specyficznych styli dla kazdej z aplikacji, jako zmiany stylu wspolnego, aby nadac charakter aplikacji.
12. Zaproponowana struktura ma byc spojna, prosta, minimalistyczna, latwa do edycji.
13. Zaloz, ze wersja jezykowa podstawowa, to angielska.
14. Na podsatwie wersji angielskiej beda przygotowywane tlumaczenia.
15. Chce miec jasny, klarowny i jednoznaczny dokument, ktory opisuje, jak przygotowywac kontent na kazdym z poziomow.
16. Jesli zaproponowana tutaj struktura nie jest optymalna z punktu widzenia implementacji, to smialo zaproponuj nowa, inna.
17. Jeszcze raz powtorze: **wszystkie pliki sa statyczne**. 
  