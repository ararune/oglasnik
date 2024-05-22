# urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from oglasnik.views import ZupanijaViewSet, GradViewSet, KorisnikViewSet, KategorijaViewSet, OglasViewSet, SlikaViewSet
from oglasnik.views import registracija, trenutni_korisnik, profil, kreiraj_oglas, moji_oglasi, izbrisi_oglas, uredi_oglas
from oglasnik.views import oglasi_po_kategoriji, oglas_detalji, odjavi_korisnika
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.shortcuts import redirect


def home(request):
    return redirect('http://localhost:3000/')

router = routers.DefaultRouter()
router.register(r'zupanije', ZupanijaViewSet)
router.register(r'gradovi', GradViewSet)
router.register(r'korisnici', KorisnikViewSet)
router.register(r'kategorije', KategorijaViewSet)
router.register(r'oglasi', OglasViewSet)
router.register(r'slike', SlikaViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/trenutni_korisnik/', trenutni_korisnik, name='trenutni_korisnik'),
    path('', home, name='home'),
    path('api/odjava/', odjavi_korisnika, name='logout_user'),
    path('registracija/', registracija, name='registracija'),
    path('prijava/', auth_views.LoginView.as_view(template_name='prijava.html', success_url='localhost:3000/'), name='prijava'),
    path('profil/', profil, name='profil'),
    path('kreiraj_oglas/', kreiraj_oglas, name='kreiraj_oglas'),
    path('moji_oglasi/', moji_oglasi, name='moji_oglasi'),
    path('<str:url>/', oglasi_po_kategoriji, name='oglasi_po_kategoriji'),
    path('<str:kategorija_url>/<str:oglas_naziv>-oglas-<str:sifra>/', oglas_detalji, name='oglas_detalji'),
    path('<str:kategorija_url>/uredi/<str:oglas_naziv>-oglas-<str:sifra>/', uredi_oglas, name='uredi_oglas'),
    path('izbrisi_oglas/<int:oglas_id>/', izbrisi_oglas, name='izbrisi_oglas'),  
]

