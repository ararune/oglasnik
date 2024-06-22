# urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from oglasnik.views import ZupanijaViewSet, GradViewSet, KorisnikViewSet, KategorijaViewSet, OglasViewSet, SlikaViewSet, FavoritViewSet
from oglasnik.views import registracija, trenutni_korisnik, profil, kreiraj_oglas, moji_oglasi, izbrisi_oglas, uredi_oglas, dohvati_korisnika, admin_view
from oglasnik.views import oglasi_po_kategoriji, oglas_detalji, odjavi_korisnika, pretraga_oglasi, azuriraj_oglas, azuriraj_korisnika, promjena_lozinke, azuriraj_korisnika_admin
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.shortcuts import redirect
from django.conf import settings
from django.conf.urls.static import static
def home(request):
    return redirect('http://localhost:3000/')

router = routers.DefaultRouter()
router.register(r'zupanije', ZupanijaViewSet)
router.register(r'gradovi', GradViewSet)
router.register(r'korisnici', KorisnikViewSet)
router.register(r'kategorije', KategorijaViewSet)
router.register(r'oglasi', OglasViewSet)
router.register(r'slike', SlikaViewSet)
router.register(r'favoriti', FavoritViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/trenutni_korisnik/', trenutni_korisnik, name='trenutni_korisnik'),
    path('', home, name='home'),
    path('oglasi/<str:url>/', oglasi_po_kategoriji, name='oglasi_po_kategoriji'),
    path('korisnik/<str:username>/', dohvati_korisnika, name='korisnik_detail'),
    path('api/kreiraj_oglas/', kreiraj_oglas, name='kreiraj_oglas'),
    path('api/azuriraj_oglas/<int:oglas_id>/', azuriraj_oglas, name='azuriraj_oglas'),
    path('api/moji_oglasi/', moji_oglasi, name='moji_oglasi'),
    path('api/oglas/<int:pk>/izbrisi/', izbrisi_oglas, name='izbrisi_oglas'),
    path('api/odjava/', odjavi_korisnika, name='logout_user'),
    path('registracija/', registracija, name='registracija'),
    path('azuriraj-korisnika/', azuriraj_korisnika, name='azuriraj_korisnika'),
    path('promjena-lozinke/', promjena_lozinke, name='promjena_lozinke'),
    path('prijava/', auth_views.LoginView.as_view(template_name='prijava.html', success_url='localhost:3000/'), name='prijava'),
    path('profil/', profil, name='profil'),
    path('api/pretraga/', pretraga_oglasi, name='pretraga_oglasi'),
    path('favoriti/dodaj/', FavoritViewSet.as_view({'post': 'dodaj'}), name='dodaj-favorit'),
    path('favoriti/ukloni/', FavoritViewSet.as_view({'delete': 'ukloni'}), name='ukloni-favorit'),
    path('favoriti/moji_favoriti/', FavoritViewSet.as_view({'get': 'moji_favoriti'}), name='moji-favoriti'),
    path('oglas/<str:sifra>/', oglas_detalji, name='oglas_detalji'),
    path('admin-panel/', admin_view, name='admin-panel'),
    path('admin-panel/azuriraj-korisnika/<int:user_id>/', azuriraj_korisnika_admin, name='azuriraj_korisnika_admin'),
    path('<str:kategorija_url>/uredi/<str:oglas_naziv>-oglas-<str:sifra>/', uredi_oglas, name='uredi_oglas'),
    path('izbrisi_oglas/<int:oglas_id>/', izbrisi_oglas, name='izbrisi_oglas'),  
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)